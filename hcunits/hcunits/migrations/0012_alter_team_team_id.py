# Generated by Django 3.2.16 on 2023-02-22 19:31

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('hcunits', '0011_auto_20230222_1931'),
    ]

    operations = [
        migrations.AlterField(
            model_name='team',
            name='team_id',
            field=models.UUIDField(db_index=True, default=uuid.UUID('914123e9-b9e8-48cc-93d5-93baed281777'), editable=False, unique=True),
        ),
    ]