from django.db import models
from django.contrib.auth.models import User

class Technician(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='technician_profile')
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    specialty = models.CharField(max_length=200, blank=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.name

class Client(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    department = models.CharField(max_length=100, blank=True)
    
    def __str__(self):
        return self.name

class Ticket(models.Model):
    # ... (existing choices) ...
    CATEGORY_CHOICES = [
        ('Network Issue', 'Network Issue'),
        ('Computer Support', 'Computer Support'),
        ('Database Issue', 'Database Issue'),
        ('Systems Issue', 'Systems Issue'),
        ('General Repair', 'General Repair'),
    ]
    
    PRIORITY_CHOICES = [
        ('Critical', 'Critical'),
        ('High', 'High'),
        ('Medium', 'Medium'),
        ('Low', 'Low'),
    ]
    
    STATUS_CHOICES = [
        ('Reported', 'Reported'),
        ('Assigned', 'Assigned'),
        ('In Progress', 'In Progress'),
        ('Resolved', 'Resolved'),
        ('Closed', 'Closed'),
    ]
    
    # Existing fields
    ticket_number = models.CharField(max_length=20, unique=True, blank=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Reported')
    
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='tickets')
    technician = models.ForeignKey(Technician, on_delete=models.SET_NULL, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    time_spent = models.IntegerField(default=0, help_text="Time spent in minutes")
    notes = models.TextField(blank=True)
    
    # NEW FIELD: tracks which user created the ticket
    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='tickets_created',
        null=True,          # Temporary: allow null for existing rows
        blank=True
    )
    
    def save(self, *args, **kwargs):
        if not self.ticket_number:
            import datetime
            year = datetime.datetime.now().year
            last_ticket = Ticket.objects.filter(ticket_number__startswith=f'TICK-{year}').order_by('ticket_number').last()
            if last_ticket:
                last_num = int(last_ticket.ticket_number.split('-')[-1])
                new_num = str(last_num + 1).zfill(3)
            else:
                new_num = '001'
            self.ticket_number = f'TICK-{year}-{new_num}'
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.ticket_number} - {self.title}"

class Attachment(models.Model):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='ticket_attachments/')
    name = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name