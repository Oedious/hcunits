# Generated by Django 3.2.16 on 2023-02-16 04:56

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('hcunits', '0007_auto_20230215_1551'),
    ]

    operations = [
        migrations.AlterField(
            model_name='team',
            name='team_id',
            field=models.UUIDField(db_index=True, default=uuid.UUID('39077b75-adab-4ca8-a1f0-d6df6f783e73'), editable=False, unique=True),
        ),
        migrations.AlterField(
            model_name='team',
            name='visibility',
            field=models.CharField(choices=[('private', 'Private'), ('unlisted', 'Unlisted'), ('public', 'Public')], default='private', max_length=16),
        ),
    ]
