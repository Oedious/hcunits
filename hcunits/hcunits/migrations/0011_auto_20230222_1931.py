# Generated by Django 3.2.16 on 2023-02-22 19:31

from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
        ('hcunits', '0010_auto_20230216_1739'),
    ]

    operations = [
        migrations.AlterField(
            model_name='team',
            name='team_id',
            field=models.UUIDField(db_index=True, default=uuid.UUID('5e203ddf-8c9f-41fe-8f64-6e25675200a3'), editable=False, unique=True),
        ),
        migrations.CreateModel(
            name='UserProfile',
            fields=[
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, primary_key=True, serialize=False, to='auth.user')),
                ('favorites', models.ManyToManyField(to='hcunits.Unit')),
            ],
        ),
    ]
