import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-register',
  templateUrl: './register.html',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  styleUrls: ['./register.css'],
})
export class Register implements OnInit {
  registerForm!: FormGroup;
  branches: any[] = [];

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnInit(): void {
    console.log("sta")
      this.registerForm = this.fb.group({
        username: ['', [Validators.required, Validators.minLength(5)]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        branchIfscCode: ['', [Validators.required]],
      });
    this.loadBranches();
  }

  loadBranches(): void {
    this.http.get<any[]>('https://smartbanking-production.up.railway.app/api/auth/branches').subscribe({
      next: (data) =>{
          this.branches = data,
          
          console.log(this.branches)
      },
      error: (err) => console.error('Failed to load branches', err),
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.http
        .post('https://smartbanking-production.up.railway.app/api/auth/registerBanker', this.registerForm.value)
        .subscribe({
          next: (res) => alert('Banker registered successfully!'),
          error: (err) => alert('Registration failed'),
        });
    }
  }
}
