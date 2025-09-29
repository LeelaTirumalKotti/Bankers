import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true, // Assuming standalone component based on the `imports` array
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  loginForm = new FormGroup({
    username: new FormControl(''),
    password: new FormControl('')
  })

  // 1. Inject HttpClient AND Angular Router
  constructor(private http: HttpClient, private router: Router) {} // 👈 Inject Router

  onsubmit() {

    this.http.post("http://localhost:8080/api/auth/login", this.loginForm.value)
      .subscribe({
        next: (response: any) => {
          console.log(response);
          if(response.status==="PENDING"){
            alert("Banker is not approved")
          }
          else if(response.status==="REJECTED"){
            alert("Banker is Rejected")
          }
              //Adding token and role to localstorage 
              else{
              localStorage.setItem('accessToken', response.token)
                localStorage.setItem('role',response.role)
                
                this.router.navigate(['/dashboard'],{
                  state:{
                    loginResponse:response
                  }
                }); // Navigate to the dashboard route
              }
            },
        error: (error: any) => {
          console.error("Login failed:", error); // Changed from "Registration failed" to "Login failed"
        }
      });
  }
}