from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import ListAPIView, RetrieveAPIView
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from .models import Ticket, Attachment
from .serializers import TicketSerializer

class TicketListView(ListAPIView):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer

class TicketDetailView(RetrieveAPIView):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    lookup_field = 'id'

class TicketAttachmentUploadView(APIView):
    def post(self, request, ticket_id):
        ticket = get_object_or_404(Ticket, id=ticket_id)
        files = request.FILES.getlist('files')
        if not files:
            return Response({'message': 'No files uploaded'}, status=status.HTTP_400_BAD_REQUEST)

        for file in files:
            # Optional: size limit 10MB
            if file.size > 10 * 1024 * 1024:
                continue

            Attachment.objects.create(
                ticket=ticket,
                filename=file.name,
                mime_type=file.content_type,
                size=file.size,
                data=file.read()
            )

        return Response({'message': 'Files uploaded successfully'}, status=status.HTTP_200_OK)

class AttachmentDownloadView(APIView):
    def get(self, request, attachment_id):
        attachment = get_object_or_404(Attachment, id=attachment_id)
        response = HttpResponse(attachment.data, content_type=attachment.mime_type)
        response['Content-Disposition'] = f'inline; filename="{attachment.filename}"'
        return response

class AttachmentDeleteView(APIView):
    def delete(self, request, attachment_id):
        attachment = get_object_or_404(Attachment, id=attachment_id)
        attachment.delete()
        return Response({'message': 'Deleted successfully'}, status=status.HTTP_200_OK)