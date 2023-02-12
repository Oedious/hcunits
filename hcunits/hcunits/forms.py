# forms.py

from django import forms

class AccountDeleteForm(forms.Form):
    """
    Simple form that provides a checkbox that signals deletion.
    """
    delete = forms.BooleanField(required=True, label="Yes, I choose to delete my account and all associated data.")