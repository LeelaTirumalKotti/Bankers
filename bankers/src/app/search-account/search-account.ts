import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-search-account',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-account.html',
  styleUrls: ['./search-account.css']
})
export class SearchAccount {

  accountNumber: string = '';
  display: boolean = false;
  account: any = null;

  constructor(private http: HttpClient) {}

  async searchAccount(): Promise<void> {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.error('No access token found');
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    try {
      const url = `http://localhost:8080/api/banker/account/${this.accountNumber}`;
      this.account = await firstValueFrom(this.http.get<any>(url, { headers }));
      if(this.account==null){
        alert("Account Number is Invalid")
      }
      else{
        this.display=true;
      }
      
       
    } catch (err) {
      console.error('Failed to load account details', err);
      this.display = false;
    }
  }
}
