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
  #queryset = Unit.objects.all()
  serializer_class = UnitListSerializer
  filter_backends = [filters.SearchFilter]
  search_fields = ['unit_id', 'set_id', 'name', 'real_name', 'keywords']

  def get_queryset(self):
    # Ignore empty queries.
    query = self.request.query_params.get("search")
    if not query:
      return None
    return Unit.objects.all()

class UnitDetail(ListAPIView):
  serializer_class = UnitDetailSerializer
  lookup_field = "unit_id"

  def get_queryset(self):
    unit_id = self.kwargs.get("unit_id")
    units = Unit.objects.filter(unit_id=unit_id)
    return units