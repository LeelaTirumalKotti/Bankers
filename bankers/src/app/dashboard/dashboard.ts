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
export class Dashboard implements OnInit{
  loginData: any;
  id!:number
  display: string = "dashboard"; 
  bankerData:any;
  hasVisitedDashboard: boolean = false; // Used for initial component creation

  constructor(private router: Router, private http: HttpClient) {
    if (this.router.getCurrentNavigation()?.extras.state) {
      this.loginData = history.state.loginResponse;
    }
  }

  ngOnInit(): void {
    if (this.loginData) {
      const userToken=localStorage.getItem("accessToken")
      this.id=this.loginData.id;

      // Set true immediately to allow the child component to start fetching its data
      this.hasVisitedDashboard = true; 
      
      // BANKER DATA Fetch
      const headers = new HttpHeaders({
        Authorization: `Bearer ${userToken}`
      });
      this.http.get(`https://smartbanking-production.up.railway.app/api/banker/bankerData/${this.id}`, {headers})
      .subscribe({
        next: (response: any) => {       
            this.bankerData=response;
            },
        error: (error: any) => {
          console.error("Error fetching banker data:", error); 
        }
      });
    } else {
      console.warn('No login state data found.');
    }
  }

  displayFunction(key:string){
      this.display = key;
  }

  logOut(){
    localStorage.removeItem('accessToken');
    this.router.navigate(['/login'])
  }
}