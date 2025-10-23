import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { KycUpdates } from "../kyc-updates/kyc-updates";
import { CommonModule } from '@angular/common';
import { SearchAccount } from "../search-account/search-account";
import { Bankerdashboard } from "../bankerdashboard/bankerdashboard";
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [KycUpdates, CommonModule, SearchAccount, Bankerdashboard],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  loginData: any;
  id!: number;
  display: string = "kyc";
  bankerData: any;
  hasVisitedDashboard: boolean = false;
  dashboardKey: number = 0;
  isBankerDataLoaded = false;

  constructor(private router: Router, private http: HttpClient) {
    if (this.router.getCurrentNavigation()?.extras.state) {
      this.loginData = history.state.loginResponse;
    }
  }

  ngOnInit(): void {
    if (this.loginData) {
      const userToken = localStorage.getItem("accessToken");
      this.id = this.loginData.id;

      this.hasVisitedDashboard = true;

      const headers = new HttpHeaders({
        Authorization: `Bearer ${userToken}`
      });

      this.http.get(`https://smartbanking-production.up.railway.app/api/banker/bankerData/${this.id}`, { headers })
        .subscribe({
          next: (response: any) => {
            this.bankerData = response;
                  this.isBankerDataLoaded = true; // ✅ mark data as ready
          },
          error: (error: any) => {
            console.error("Error fetching banker data:", error);
          }
        });
    } else {
      console.warn('No login state data found.');
    }
  }

  displayFunction(key: string): void {
    this.display = key;
  console.log(this.display)
  }

  logOut(): void {
    localStorage.removeItem('accessToken');
    this.router.navigate(['/login']);
  }
}
