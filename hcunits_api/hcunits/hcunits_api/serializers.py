from hcunits.hcunits_api.models import Unit
from rest_framework import serializers

class UnitListSerializer(serializers.ModelSerializer):
  class Meta:
    model = Unit
    fields = ['unit_id', 'set_id', 'name', 'collector_number', 'point_values', 'rarity']
    
class UnitDetailSerializer(serializers.ModelSerializer):
  class Meta:
    model = Unit
    fields = '__all__'