import { Component, Input, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule, BaseChartDirective } from 'ng2-charts';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChartConfiguration, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-bankerdashboard',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './bankerdashboard.html',
  styleUrls: ['./bankerdashboard.css']
})
export class Bankerdashboard implements OnInit, AfterViewInit {
  @Input() bankerData: any;

  @ViewChild('pieChart', { static: false }) pieChart?: BaseChartDirective;
  @ViewChild('barChart', { static: false }) barChart?: BaseChartDirective;

  chartsReady = false;

  accounts: any[] = [];
  profiles: any[] = [];

  birthYearCounts: { [year: string]: number } = {};

  pieChartData: ChartConfiguration<'pie'>['data'] = {
    labels: ['SAVINGS', 'CURRENT', 'CREDIT'],
    datasets: [
      {
        data: [0, 0, 0],
        backgroundColor: ['#4CAF50', '#2196F3', '#FFC107']
      }
    ]
  };

  pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: 'Account Types Distribution'
      }
    }
  };

ageGroupChartData: ChartConfiguration<'bar'>['data'] = {
  labels: ['18–29', '30–59', '60+'],
  datasets: [
    {
      data: [0, 0, 0],
      label: 'Customer Age Groups',
      backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726']
    }
  ]
};

ageGroupChartOptions: ChartOptions<'bar'> = {
  responsive: true,
  plugins: {
    legend: { display: false },
    title: {
      display: true,
      text: 'Customer Profiles by Age Group'
    }
  }
};


  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    if (this.bankerData) {
      const token = localStorage.getItem('accessToken');
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`
      });

      const branchId = this.bankerData.branches.branchId;

      this.http.get<any[]>(`https://smartbanking-production.up.railway.app/api/banker/getAccountsByBranches/${branchId}`, { headers })
        .subscribe(response => {
          this.accounts = response;
          console.log(response)
          this.updateChartData();
        }, error => {
          console.log("accounts")
          console.error('Error fetching accounts:');
        });

      this.http.get<any[]>(`https://smartbanking-production.up.railway.app/api/banker/getCustomerProfiles/${branchId}`, { headers })
        .subscribe(response => {
          this.profiles = response;
          this.processBirthYears();
        }, error => {
          console.log("profiles")
          console.error('Error fetching profiles:');
        });
    }
  }

  ngAfterViewInit(): void {
    this.chartsReady = true;
  }

  updateChartData(): void {
    const typeCounts: Record<'SAVINGS' | 'CURRENT' | 'CREDIT', number> = {
      SAVINGS: 0,
      CURRENT: 0,
      CREDIT: 0
    };

    this.accounts.forEach(account => {
      const type = account.accountType?.toUpperCase();
      if (typeCounts[type as keyof typeof typeCounts] !== undefined) {
        typeCounts[type as keyof typeof typeCounts]++;
      }
    });

    this.pieChartData.datasets[0].data = [
      typeCounts['SAVINGS'],
      typeCounts['CURRENT'],
      typeCounts['CREDIT']
    ];

    if (this.chartsReady && this.pieChart?.update) {
      this.pieChart.update();
    }
  }

 processBirthYears(): void {
  const now = new Date();
  let age18to29 = 0;
  let age30to59 = 0;
  let age60plus = 0;

  this.profiles.forEach(profile => {
    const dob = new Date(profile.dateOfBirth);
    let age = now.getFullYear() - dob.getFullYear();
    const monthDiff = now.getMonth() - dob.getMonth();
    const dayDiff = now.getDate() - dob.getDate();
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--; // adjust if birthday hasn't occurred yet this year
    }

    if (age >= 18 && age < 30) age18to29++;
    else if (age >= 30 && age < 60) age30to59++;
    else if (age >= 60) age60plus++;
  });

  this.ageGroupChartData.datasets[0].data = [age18to29, age30to59, age60plus];

  if (this.chartsReady && this.barChart?.update) {
    this.barChart.update();
  }
}

}
