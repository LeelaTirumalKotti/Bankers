import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, catchError, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-search-account',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-account.html',
  styleUrls: ['./search-account.css']
})
export class SearchAccount {
  accountNumber: string = '';
  invalidAccount = false;
  account$ = new BehaviorSubject<any | null>(null);

  constructor(private http: HttpClient) {}

searchAccount(): void {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    console.error('No access token found');
    return;
  }

  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

  const url = `https://smartbanking-production.up.railway.app/api/banker/account/${this.accountNumber}`;

  this.http.get<any>(url, { headers }).pipe(
    catchError(err => {
      console.error('Failed to load account details', err);
      this.invalidAccount = true;
      this.account$.next(null);
      return of(null);
    })
  ).subscribe(account => {
    if (!account) {
      this.invalidAccount = true;
      this.account$.next(null);
    } else {
      this.invalidAccount = false;
      this.account$.next(account);
    }
  });
}
}
