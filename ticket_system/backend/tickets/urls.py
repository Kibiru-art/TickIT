from django.urls import path
from .views import (
    TicketListView,
    TicketDetailView,
    TicketAttachmentUploadView,
    AttachmentDownloadView,
    AttachmentDeleteView,
)

urlpatterns = [
    path('tickets/', TicketListView.as_view(), name='ticket-list'),
    path('tickets/<int:id>/', TicketDetailView.as_view(), name='ticket-detail'),
    path('tickets/<int:ticket_id>/attachments/', TicketAttachmentUploadView.as_view(), name='upload-attachment'),
    path('attachments/<int:attachment_id>/', AttachmentDownloadView.as_view(), name='download-attachment'),
    path('attachments/<int:attachment_id>/delete/', AttachmentDeleteView.as_view(), name='delete-attachment'),
]