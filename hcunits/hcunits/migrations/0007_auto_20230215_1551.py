# Generated by Django 3.2.16 on 2023-02-15 15:51

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('hcunits', '0006_auto_20230215_0239'),
    ]

    operations = [
        migrations.CreateModel(
            name='Unit',
            fields=[
                ('unit_id', models.CharField(max_length=32, primary_key=True, serialize=False)),
                ('set_id', models.CharField(max_length=16)),
                ('collector_number', models.CharField(max_length=16)),
                ('name', models.TextField()),
                ('type', models.CharField(max_length=21)),
                ('point_values', models.JSONField()),
                ('age', models.CharField(max_length=6)),
                ('rarity', models.CharField(blank=True, max_length=15, null=True)),
                ('real_name', models.TextField(blank=True, null=True)),
                ('special_type', models.CharField(blank=True, max_length=15, null=True)),
                ('dimensions', models.CharField(blank=True, max_length=3, null=True)),
                ('team_abilities', models.JSONField()),
                ('keywords', models.JSONField()),
                ('special_powers', models.JSONField()),
                ('improved_movement', models.JSONField()),
                ('improved_targeting', models.JSONField()),
                ('object_type', models.CharField(blank=True, max_length=11, null=True)),
                ('object_keyphrases', models.JSONField()),
                ('unit_range', models.IntegerField(blank=True, null=True)),
                ('targets', models.IntegerField(blank=True, null=True)),
                ('speed_type', models.CharField(blank=True, max_length=17, null=True)),
                ('attack_type', models.CharField(blank=True, max_length=12, null=True)),
                ('defense_type', models.CharField(blank=True, max_length=11, null=True)),
                ('damage_type', models.CharField(blank=True, max_length=9, null=True)),
                ('dial_size', models.IntegerField(blank=True, null=True)),
                ('dial', models.JSONField()),
            ],
            options={
                'db_table': 'units',
                'managed': False,
            },
        ),
        migrations.AlterField(
            model_name='team',
            name='team_id',
            field=models.UUIDField(db_index=True, default=uuid.UUID('e2c545a1-5a6f-48d3-83ba-4fa41f895400'), editable=False, unique=True),
        ),
    ]