from django.contrib import admin
from .models import Ticket, Client, Attachment

admin.site.register(Ticket)
admin.site.register(Client)
admin.site.register(Attachment)