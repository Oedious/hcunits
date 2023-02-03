from django.db.models import Q
from rest_framework import filters
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.generics import ListAPIView
from rest_framework.generics import RetrieveAPIView
from rest_framework.response import Response
from rest_framework.views import APIView
from hcunits.hcunits_api.models import Unit
from hcunits.hcunits_api.serializers import UnitListSerializer
from hcunits.hcunits_api.serializers import UnitDetailSerializer

class SetDetail(ListAPIView):
  serializer_class = UnitListSerializer

  def get_queryset(self):
    set_id = self.kwargs.get("set_id")
    units = Unit.objects.filter(set_id=set_id)
    return units


class UnitList(ListAPIView):
  serializer_class = UnitListSerializer
  filter_backends = [filters.SearchFilter]
  search_fields = ['unit_id', 'set_id', 'name', 'real_name', 'keywords']

  def get_queryset(self):
    # Ignore empty queries.
    query = self.request.query_params.get("search")
    if not query:
      return None
    return Unit.objects.all()


class UnitDetail(RetrieveAPIView):
  serializer_class = UnitDetailSerializer
  lookup_field = "unit_id"

  def get_queryset(self):
    unit_id = self.kwargs.get("unit_id")
    units = Unit.objects.filter(unit_id=unit_id)
    return units


class Search(APIView):
  serializer_class = UnitListSerializer
  filter_backends = [filters.SearchFilter]

  def post(self, request, format=None):
    is_valid = False
    queryset = Unit.objects.all()

    # Filter on "name" and "real_name"
    for field in ['name', 'real_name']:
      for (suffix, lookup) in [('_has', '__icontains'),
                               ('_is', '__iexact'),
                               ('_begins', '__istartswith'),
                               ('_ends', '__iendswith')]:
        param = request.data.get(field + suffix, None)
        if param:
          kwargs = {field + lookup: param}
          queryset = queryset.filter(**kwargs)
          is_valid = True
      
    # Handle sets as an "or", since it's impossible to have a single item in
    # multiple sets.
    set_ids = request.data.get('set_ids', None)
    if set_ids and len(set_ids) > 0:
      query = Q()
      for set_id in set_ids:
        if len(set_id) > 0:
          query |= Q(set_id=set_id)
          is_valid = True
      queryset = queryset.filter(query)

    # Filter on "point_value"
    point_value = int(request.data.get('point_value_equals', -1))
    if point_value >= 0:
      queryset = queryset.filter(point_values__contains=point_value)
      is_valid = True

    MAX_POINT_VALUES = 4
    for (suffix, lookup) in [('_less_than', '__lte'),
                             ('_greater_than', '__gte')]:
      param = int(request.data.get('point_value' + suffix, -1))
      if param >= 0:
        query = Q()
        for i in range(MAX_POINT_VALUES):
          kwargs = {'point_values__' + str(i) + lookup: param}
          query |= Q(**kwargs)
        queryset = queryset.filter(query)
        is_valid = True

    point_value_from = int(request.data.get('point_value_from', -1))
    point_value_to = int(request.data.get('point_value_to', -1))
    if point_value_from >= 0 and point_value_to >= 0:
      query = Q()
      for i in range(MAX_POINT_VALUES):
        kwargs1 = {'point_values__%d__gte' % i: point_value_from}
        kwargs2 = {'point_values__%d__lte' % i: point_value_to}
        query |= (Q(**kwargs1) & Q(**kwargs2))
      queryset = queryset.filter(query)
      is_valid = True

    # Handle 'types' as an "or", since it's impossible to have a single item of
    # multiple types.
    type_ids = request.data.get('types', None)
    if type_ids and len(type_ids) > 0:
      query = Q()
      for type_id in type_ids:
        if len(type_id) > 0:
          query |= Q(type=type_id)
          is_valid = True
      queryset = queryset.filter(query)

    # Handle keywords, with an implicit "and" operator.
    keywords = request.data.get('keywords', None)
    if keywords and len(keywords) > 0:
      queryset = queryset.filter(keywords__contains=keywords)
      is_valid = True

    # Handle 'combat types' as an "or" for each particular type, since it's
    # impossible to have a single item of multiple types.
    for field in ['speed', 'attack', 'defense', 'damage']:
      param_arr = request.data.get(field + '_types', None)
      if param_arr and len(param_arr) > 0:
        query = Q()
        for param in param_arr:
          if len(param) > 0:
            kwargs = {field + '_type': param}
            queryset = queryset.filter(**kwargs)
        queryset = queryset.filter(query)
        is_valid = True

    # Filter on "unit_range" and "targets" combat values
    for field in ['unit_range', 'targets']:
      for (suffix, lookup) in [('_equals', ''),
                               ('_less_than', '__lte'),
                               ('_greater_than', '__gte')]:
        param = int(request.data.get(field + suffix, -1))
        if param >= 0:
          kwargs = {field + lookup: param}
          queryset = queryset.filter(**kwargs)
          is_valid = True

      param_from = int(request.data.get(field + '_from', -1))
      param_to = int(request.data.get(field + '_to', -1))
      if param_from >= 0 and param_to >= 0:
        kwargs1 = {field + '__gte': param_from}
        kwargs2 = {field + '__lte': param_to}
        queryset = queryset.filter(**kwargs1).filter(**kwargs2)
        is_valid = True

    # Filter on dial combat values
    MAX_DIAL_SIZE = 26
    for field in ['speed', 'attack', 'defense', 'damage']:
      param = int(request.data.get(field + '_equals', -1))
      if param >= 0:
        kwargs = {'dial__contains': {field + '_value': param}}
        queryset = queryset.filter(**kwargs)
        is_valid = True

      for (suffix, lookup) in [('_less_than', '__lte'),
                               ('_greater_than', '__gte')]:
        param = int(request.data.get(field + suffix, -1))
        if param >= 0:
          query = Q()
          for i in range(MAX_DIAL_SIZE):
            kwargs = {'dial__%d__%s_value%s' % (i, field, lookup): param}
            query |= Q(**kwargs)
          queryset = queryset.filter(query)
          is_valid = True

      param_from = int(request.data.get(field + '_from', -1))
      param_to = int(request.data.get(field + '_to', -1))
      if param_from >= 0 and param_to >= 0:
        query = Q()
        for i in range(MAX_DIAL_SIZE):
          kwargs1 = {'dial__%d__%s_value__gte' % (i, field): param_from}
          kwargs2 = {'dial__%d__%s_value__lte' % (i, field): param_to}
          query |= (Q(**kwargs1) & Q(**kwargs2))
        queryset = queryset.filter(query)
        is_valid = True

    # Only return a valid response if there was at least one valid filter
    if not is_valid:
      queryset = None
    serializer = UnitListSerializer(queryset, many=True)
    return Response(serializer.data)
