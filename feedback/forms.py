from django import forms

from .models import Campaign, Feedback


class CampaignForm(forms.ModelForm):

    class Meta:
        model = Campaign
        fields = ('message',)


class FeedbackForm(forms.ModelForm):

    class Meta:
        model = Feedback
        fields = ('feedback',)
