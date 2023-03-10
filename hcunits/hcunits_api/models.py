# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey has `on_delete` set to the desired behavior.
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from __future__ import unicode_literals

from django.db import models


class Unit(models.Model):
    unit_id = models.CharField(primary_key=True, max_length=32)
    set_id = models.CharField(max_length=8)
    collector_number = models.CharField(max_length=24)
    name = models.TextField()
    type = models.CharField(max_length=21)
    point_values = models.JSONField()
    rarity = models.CharField(max_length=15, blank=True, null=True)
    real_name = models.TextField(blank=True, null=True)
    properties = models.JSONField()
    dimensions = models.CharField(max_length=3, blank=True, null=True)
    team_abilities = models.JSONField()
    keywords = models.JSONField()
    special_powers = models.JSONField()
    improved_movement = models.JSONField()
    improved_targeting = models.JSONField()
    object_type = models.CharField(max_length=11, blank=True, null=True)
    object_size = models.CharField(max_length=11, blank=True, null=True)
    object_keyphrases = models.JSONField()
    bystander_type = models.CharField(max_length=9, blank=True, null=True)
    horde_stack_max = models.IntegerField(blank=True, null=True)
    relic_roll_min = models.IntegerField(blank=True, null=True)
    attachment_type = models.CharField(max_length=12, blank=True, null=True)
    map_url = models.TextField(blank=True, null=True)
    unit_range = models.IntegerField(blank=True, null=True)
    passengers = models.IntegerField(blank=True, null=True)
    targets = models.IntegerField(blank=True, null=True)
    speed_type = models.CharField(max_length=17, blank=True, null=True)
    attack_type = models.CharField(max_length=12, blank=True, null=True)
    defense_type = models.CharField(max_length=11, blank=True, null=True)
    damage_type = models.CharField(max_length=9, blank=True, null=True)
    dial_size = models.IntegerField(blank=True, null=True)
    dial = models.JSONField()

    class Meta:
        app_label = 'hcunits'
        managed = False
        db_table = 'units'
