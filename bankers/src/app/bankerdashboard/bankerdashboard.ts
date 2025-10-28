import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule, BaseChartDirective } from 'ng2-charts';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { forkJoin, of } from 'rxjs';
import { catchError, tap, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-bankerdashboard',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './bankerdashboard.html',
  styleUrls: ['./bankerdashboard.css']
})
export class Bankerdashboard implements OnInit {
  @Input() bankerData: any;

  @ViewChild('pieChart') pieChart?: BaseChartDirective;
  @ViewChild('barChart') barChart?: BaseChartDirective;

  accounts: any[] = [];
  profiles: any[] = [];

  accountsLoaded = false;
  profilesLoaded = false;

  showPieChart = false;
  showBarChart = false;

  pieChartData: ChartConfiguration<'pie'>['data'] = {
    labels: ['SAVINGS', 'CURRENT', 'CREDIT'],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: ['#4CAF50', '#2196F3', '#FFC107']
    }]
  };
  pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Account Types Distribution' }
    }
  };

  ageGroupChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['18–29', '30–59', '60+'],
    datasets: [{
      data: [0, 0, 0],
      label: 'Customer Age Groups',
      backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726']
    }]
  };
  ageGroupChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Customer Profiles by Age Group' }
    },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    if (!this.bankerData) return;

    const token = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    const branchId = this.bankerData.branches.branchId;

    const accounts$ = this.http.get<any[]>(`https://smartbanking-production.up.railway.app/api/banker/getAccountsByBranches/${branchId}`, { headers }).pipe(
      tap(response => {
        this.accounts = response;
        this.processPieChartData();
      }),
      catchError(error => {
        console.error('Error fetching accounts:', error);
        return of([]);
      })
    );

    const profiles$ = this.http.get<any[]>(`https://smartbanking-production.up.railway.app/api/banker/getCustomerProfiles/${branchId}`, { headers }).pipe(
      tap(response => {
        this.profiles = response;
        this.processBarChartData();
      }),
      catchError(error => {
        console.error('Error fetching profiles:', error);
        return of([]);
      })
    );

    forkJoin([accounts$, profiles$])
      .pipe(finalize(() => {
        this.accountsLoaded = true;
        this.profilesLoaded = true;

        setTimeout(() => {
          if (this.accounts.length > 0) {
            this.pieChart?.update();
            this.showPieChart = true;
          }
          if (this.profiles.length > 0) {
            this.barChart?.update();
            this.showBarChart = true;
          }
        }, 0);
      }))
      .subscribe();
  }

  processPieChartData(): void {
    if (this.accounts.length === 0) return;
    const typeCounts = { SAVINGS: 0, CURRENT: 0, CREDIT: 0 };
    this.accounts.forEach(account => {
      const type = account.accountType?.toUpperCase() as keyof typeof typeCounts;
      if (typeCounts[type] !== undefined) {
        typeCounts[type]++;
      }
    });
    this.pieChartData.datasets[0].data = [
      typeCounts['SAVINGS'], typeCounts['CURRENT'], typeCounts['CREDIT']
    ];
  }

  processBarChartData(): void {
    if (this.profiles.length === 0) return;
    const now = new Date();
    let age18to29 = 0, age30to59 = 0, age60plus = 0;

    this.profiles.forEach(profile => {
      const dob = new Date(profile.dateOfBirth);
      let age = now.getFullYear() - dob.getFullYear();
      if (now.getMonth() < dob.getMonth() || (now.getMonth() === dob.getMonth() && now.getDate() < dob.getDate())) {
        age--;
      }
      if (age >= 18 && age < 30) age18to29++;
      else if (age >= 30 && age < 60) age30to59++;
      else if (age >= 60) age60plus++;
    });

    this.ageGroupChartData.datasets[0].data = [age18to29, age30to59, age60plus];
  }

  
}
