import os
import re
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
    # For team-up cards, just use the image of the regular unit.
    collector_number = unit.collector_number
    if "team_up" in unit.properties:
      collector_number = re.sub("\.\d{1,2}", "", collector_number)
      print(collector_number)
    path = "static/images/set/%s/%s.png" % (unit.set_id, collector_number)
    if os.path.exists(path):
      return "/" + path
    return None
  
  class Meta:
    model = Unit
    fields = '__all__'