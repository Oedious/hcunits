from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from hcunits.hcunits_api.models import Unit
from hcunits.hcunits_api.serializers import SetDetailSerializer
from hcunits.hcunits_api.serializers import UnitDetailSerializer

@api_view(['GET'])
def set_detail(request, set_id, format=None):
  try:
    units = Unit.objects.filter(set_id=set_id)
  except Unit.DoesNotExist:
    return Response(status=status.HTTP_404_NOT_FOUND)
    
  if request.method == 'GET':
    serializer = SetDetailSerializer(units, many=True)
    return Response(serializer.data)
    
@api_view(['GET'])
def unit_detail(request, unit_id, format=None):
  try:
    unit = Unit.objects.get(unit_id=unit_id)
  except Unit.DoesNotExist:
    return Response(status=status.HTTP_404_NOT_FOUND)
    
  if request.method == 'GET':
    serializer = UnitDetailSerializer(unit, context={"request": request})
    return Response(serializer.data)