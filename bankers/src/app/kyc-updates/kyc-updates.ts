import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Profiles } from "../profiles/profiles";

@Component({
  selector: 'app-kyc-updates',
  standalone: true,
  imports: [CommonModule, Profiles],
  templateUrl: './kyc-updates.html',
  styleUrls: ['./kyc-updates.css']
})
export class KycUpdates implements OnInit {
  customerProfiles: any[] = [];
  
  constructor(private http: HttpClient,private cdr: ChangeDetectorRef) {}
  headers:any
  ngOnInit(): void {
    const token = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
    });
    this.http.get<any[]>('https://smartbanking-production.up.railway.app/api/banker/kycPendings',{headers}).subscribe({
      next: data => {
        this.customerProfiles = data
        console.log(this.customerProfiles)
              this.cdr.detectChanges();
      },
      error: err => console.error('Failed to load KYC pendings', err)
    });
  }

  updateKycStatus(id: number, status: string): void {
    const token = localStorage.getItem('accessToken');

    const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
    });
    this.http.put(`https://smartbanking-production.up.railway.app/api/banker/profiles/${id}/kyc?status=${status}`,null, {headers}).subscribe({
      next: updated => {
        this.customerProfiles = this.customerProfiles.filter(p => p.id !== id);
      },
      error: err => console.error(`Failed to update KYC status for ${id}`, err)
    });
  }
}
