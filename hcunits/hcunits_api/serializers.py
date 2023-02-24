import os
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
    fields = ['unit_id', 'set_id', 'name', 'type', 'collector_number', 'point_values', 'rarity', 'object_type', 'bystander_type']
    
class UnitDetailSerializer(NonNullModelSerializer):
  img_url = serializers.SerializerMethodField('get_img_url')
  
  def get_img_url(self, unit):
    path = "static/images/set/%s/%s.png" % (unit.set_id, unit.collector_number)
    if os.path.exists(path):
      return "/" + path
    return ""
  
  class Meta:
    model = Unit
    fields = '__all__'