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
    COMBAT_TYPES = ['speed', 'attack', 'defense', 'damage']
    POWER_TYPES = ['speed', 'attack', 'defense', 'damage', 'special']

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
    param_list = request.data.get('set_id', [])
    if not isinstance(param_list, list):
      param_list = [param_list]
    if len(param_list) > 0:
      query = Q()
      for param in param_list:
        if len(param) > 0:
          query |= Q(set_id=param)
          is_valid = True
      queryset = queryset.filter(query)

    # Filter on "point_value"
    param = int(request.data.get('point_value_equals', -1))
    if param >= 0:
      queryset = queryset.filter(point_values__contains=param)
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

    # Handle 'type' as an "or", since it's impossible to have a single item of
    # multiple types.
    param_list = request.data.get('type', [])
    if not isinstance(param_list, list):
      param_list = [param_list]
    if len(param_list) > 0:
      query = Q()
      for param in param_list:
        if len(param) > 0:
          query |= Q(type=param)
          is_valid = True
      queryset = queryset.filter(query)

    # Handle keywords, team and improved abilities the same way, notably
    # with an implicit "and" operator.
    for (param_name, field) in [('keyword', 'keywords'),
                                ('team_ability', 'team_abilities'),
                                ('improved_movement', 'improved_movement'),
                                ('improved_targeting', 'improved_targeting')]:
      param_list = request.data.get(param_name, [])
      if not isinstance(param_list, list):
        param_list = [param_list]
      if len(param_list) > 0:
        kwargs = {field + '__contains': param_list}
        queryset = queryset.filter(**kwargs)
        is_valid = True

    # Handle 'combat types' as an "or" for each particular type, since it's
    # impossible to have a single item of multiple types.
    for field in COMBAT_TYPES:
      param_list = request.data.get(field + '_type', [])
      if not isinstance(param_list, list):
        param_list = [param_list]
      if len(param_list) > 0:
        query = Q()
        for param in param_list:
          if param and len(param) > 0:
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
    for field in COMBAT_TYPES:
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

    # Handle powers - when given multiples, they should all appear on the same
    # click number or in one of the special powers.
    powers = []
    power_type = None
    for field in POWER_TYPES:
      param_list = request.data.get(field + '_power', [])
      if not isinstance(param_list, list):
        param_list = [param_list]
      for param in param_list:
        if param and len(param) > 0:
          powers.append(param)
          power_type = field
    
    # First check if there's only a single power - if so, it's a much simpler
    # query.
    if len(powers) == 1:
      kwargs1 = {'dial__contains': {power_type + '_power': powers[0]}}
      kwargs2 = {'special_powers__contains': powers[0]}
      queryset = queryset.filter(Q(**kwargs1) | Q(**kwargs2))
      is_valid = True
    elif len(powers) > 1:
      query = Q()
      for i in range(MAX_DIAL_SIZE):
        click_query = Q()
        # Intentionally ignore the special power category.
        for field in COMBAT_TYPES:
          param_list = request.data.get(field + '_power', [])
          if not isinstance(param_list, list):
            param_list = [param_list]
          for param in param_list:
            if param and len(param) > 0:
              kwargs1 = {'dial__%d__contains' % (i): {field + '_power': param}}
              kwargs2 = {'special_powers__contains': param}
              click_query &= (Q(**kwargs1) | Q(**kwargs2))
        query |= click_query
      queryset = queryset.filter(query)
      is_valid = True

    # Only return a valid response if there was at least one valid filter
    if not is_valid:
      queryset = None
    serializer = UnitListSerializer(queryset, many=True)
    return Response(serializer.data)
