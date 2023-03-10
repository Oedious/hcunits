# Generated by Django 3.2.16 on 2023-02-25 03:55

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Unit',
            fields=[
                ('unit_id', models.CharField(max_length=32, primary_key=True, serialize=False)),
                ('set_id', models.CharField(max_length=8)),
                ('collector_number', models.CharField(max_length=24)),
                ('name', models.TextField()),
                ('type', models.CharField(max_length=12)),
                ('point_values', models.JSONField()),
                ('rarity', models.CharField(blank=True, max_length=15, null=True)),
                ('real_name', models.TextField(blank=True, null=True)),
                ('properties', models.JSONField()),
                ('dimensions', models.CharField(blank=True, max_length=3, null=True)),
                ('team_abilities', models.JSONField()),
                ('keywords', models.JSONField()),
                ('special_powers', models.JSONField()),
                ('improved_movement', models.JSONField()),
                ('improved_targeting', models.JSONField()),
                ('object_type', models.CharField(blank=True, max_length=11, null=True)),
                ('object_size', models.CharField(blank=True, max_length=11, null=True)),
                ('object_keyphrases', models.JSONField()),
                ('bystander_type', models.CharField(blank=True, max_length=9, null=True)),
                ('map_url', models.TextField(blank=True, null=True)),
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
        migrations.CreateModel(
            name='UserProfile',
            fields=[
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, primary_key=True, serialize=False, to='auth.user')),
                ('favorites', models.ManyToManyField(to='hcunits.Unit')),
            ],
        ),
        migrations.CreateModel(
            name='Team',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('team_id', models.UUIDField(db_index=True, default=None, editable=False, unique=True)),
                ('name', models.CharField(blank=True, max_length=50, null=True)),
                ('description', models.CharField(blank=True, max_length=100, null=True)),
                ('age', models.CharField(choices=[('modern', 'Modern'), ('golden', 'Golden')], default='modern', max_length=6)),
                ('point_limit', models.IntegerField(blank=True, default=300, null=True)),
                ('visibility', models.CharField(choices=[('private', 'Private'), ('unlisted', 'Unlisted'), ('public', 'Public')], default='private', max_length=16)),
                ('create_time', models.DateTimeField(auto_now_add=True)),
                ('update_time', models.DateTimeField(auto_now=True)),
                ('main_force', models.JSONField(default=list)),
                ('object_list', models.JSONField(default=list)),
                ('maps', models.JSONField(default=list)),
                ('sideline', models.JSONField(default=list)),
                ('tarot_cards', models.JSONField(default=list)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'teams',
                'managed': True,
            },
        ),
    ]
