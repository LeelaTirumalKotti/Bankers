import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-register',
  templateUrl: './register.html',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  styleUrls: ['./register.css'],
})
export class Register implements OnInit {
  registerForm!: FormGroup;
  branches$ = new BehaviorSubject<any[]>([]); // Observable for dropdown

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(5)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      branchIfscCode: ['', [Validators.required]],
    });

    this.loadBranches();
  }

  loadBranches(): void {
    this.http.get<any[]>('https://smartbanking-production.up.railway.app/api/auth/branches').subscribe({
      next: (data) => {
        this.branches$.next(data); // Push data into observable
        console.log('Branches loaded:', data);
      },
      error: (err) => console.error('Failed to load branches', err),
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.http
        .post('https://smartbanking-production.up.railway.app/api/auth/registerBanker', this.registerForm.value)
        .subscribe({
          next: () => alert('Banker registered successfully!'),
          error: () => alert('Registration failed'),
        });
    }
  }
}
