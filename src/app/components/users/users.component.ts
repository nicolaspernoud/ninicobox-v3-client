import { Component, OnInit } from '@angular/core';
import { UsersService } from '../../services/users.service';
import { User } from '../../interfaces';
import { switchMap } from 'rxjs/operators';
import { appAnimations } from '../../animations';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
  animations: [appAnimations]
})
export class UsersComponent implements OnInit {

  public users: User[];
  public loading = true;

  constructor(private usersService: UsersService, private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.usersService.getUsers().subscribe(data => {
      this.users = data;
      this.loading = false;
    });
  }

  addUser() {
    const newUser: User = {
      id: Math.max(...this.users.map(value => value.id)) + 1,
      login: 'newLogin',
      password: randomString(48),
      role: 'guest',
      longLivedToken: false
    };
    this.users.push(newUser);
  }

  delete(user: User) {
    this.users.splice(this.users.findIndex(value => value.id === user.id), 1);
  }

  save() {
    this.usersService.setUsers(this.users).pipe(
      switchMap(
        value => this.usersService.getUsers()
      )).subscribe(data => {
        this.users = data;
        this.snackBar.open('Users updated', 'OK', { duration: 2000 });
      });
  }

  setRandomPassword(user: User) {
    user.password = randomString(48);
  }

}

function randomString(length: number) {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
