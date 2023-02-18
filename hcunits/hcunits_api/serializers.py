from collections import OrderedDict
from hcunits_api.models import Unit
from rest_framework import serializers

class NonNullModelSerializer(serializers.ModelSerializer):
  def to_representation(self, instance):
    result = super(NonNullModelSerializer, self).to_representation(instance)
    return OrderedDict([(key, result[key]) for key in result if result[key] is not None])
    
class UnitListSerializer(NonNullModelSerializer):
  class Meta:
    model = Unit
    fields = ['unit_id', 'set_id', 'name', 'collector_number', 'point_values', 'rarity']
    
class UnitDetailSerializer(NonNullModelSerializer):
  class Meta:
    model = Unit
    fields = '__all__'