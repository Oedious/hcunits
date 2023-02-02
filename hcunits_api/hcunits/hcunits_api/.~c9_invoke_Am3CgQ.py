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

    # Filter on "name"
    name = request.data.get('has_name', None)
    if name:
      queryset = queryset.filter(name__icontains=name)
      is_valid = True
    name = request.data.get('is_name', None)
    if name:
      queryset = queryset.filter(name__iexact=name)
      is_valid = True
    name = request.data.get('begins_name', None)
    if name:
      queryset = queryset.filter(name__istartswith=name)
      is_valid = True
    name = request.data.get('ends_name', None)
    if name:
      queryset = queryset.filter(name__iendswith=name)
      is_valid = True
      
    # Filter on "real_name"
    real_name = request.data.get('has_real_name', None)
    if real_name:
      queryset = queryset.filter(real_name__icontains=real_name)
      is_valid = True
    real_name = request.data.get('is_real_name', None)
    if real_name:
      queryset = queryset.filter(real_name__iexact=real_name)
      is_valid = True
    real_name = request.data.get('begins_real_name', None)
    if real_name:
      queryset = queryset.filter(real_name__istartswith=real_name)
      is_valid = True
    real_name = request.data.get('ends_real_name', None)
    if real_name:
      queryset = queryset.filter(real_name__iendswith=real_name)
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
    point_value = int(request.data.get('equals_point_value', -1))
    if point_value >= 0:
      query = (Q(point_values__0=point_value) |
               Q(point_values__1=point_value) |
               Q(point_values__2=point_value) |
               Q(point_values__3=point_value))
      queryset = queryset.filter(query)
      is_valid = True

    point_value = int(request.data.get('less_than_point_value', -1))
    if point_value >= 0:
      query = (Q(point_values__0__lte=point_value) |
               Q(point_values__1__lte=point_value) |
               Q(point_values__2__lte=point_value) |
               Q(point_values__3__lte=point_value))
      queryset = queryset.filter(query)
      is_valid = True

    point_value = int(request.data.get('greater_than_point_value', -1))
    if point_value >= 0:
      query = (Q(point_values__0__gte=point_value) |
               Q(point_values__1__gte=point_value) |
               Q(point_values__2__gte=point_value) |
               Q(point_values__3__gte=point_value))
      queryset = queryset.filter(query)
      is_valid = True

    from_point_value = int(request.data.get('from_point_value', -1))
    to_point_value = int(request.data.get('to_point_value', -1))
    if from_point_value >= 0 and to_point_value >= 0:
      query = ((Q(point_values__0__gte=from_point_value) & Q(point_values__0__lte=to_point_value)) |
               (Q(point_values__1__gte=from_point_value) & Q(point_values__1__lte=to_point_value)) |
               (Q(point_values__2__gte=from_point_value) & Q(point_values__2__lte=to_point_value)) |
               (Q(point_values__3__gte=from_point_value) & Q(point_values__3__lte=to_point_value)))
      queryset = queryset.filter(query)
      is_valid = True

    # Handle keywords, with an implicit "and" operator.
    keywords = request.data.get('keywords', None)
    if keywords and len(keywords) > 0:
      for keyword in keywords:
        if len(keyword) > 0:
          queryset = queryset.filter(keywords__contains=keyword)
          is_valid = True

    # Only return a valid response if there was at least one valid filter
    if not is_valid:
      queryset = None
    serializer = UnitListSerializer(queryset, many=True)
    return Response(serializer.data)








