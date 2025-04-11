import { User, CreateUserDto, UpdateUserDto } from '../../services/userService';

export interface FilterState {
  searchTerm: string;
  selectedRoles: string[];
  filterStatus: string;
}

export type {
  User,
  CreateUserDto,
  UpdateUserDto
};