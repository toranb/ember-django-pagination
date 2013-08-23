from django.views.generic import TemplateView

from ember.person.models import Person
from ember.person.serializers import PersonSerializer

from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView


class HomeView(TemplateView):
    template_name = 'index.html'


class People(ListCreateAPIView):
    model = Person
    serializer_class = PersonSerializer


class Person(RetrieveUpdateDestroyAPIView):
    model = Person
    serializer_class = PersonSerializer
