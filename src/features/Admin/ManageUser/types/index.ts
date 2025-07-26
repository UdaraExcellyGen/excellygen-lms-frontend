// FIXED: Corrected the import path for userService
import { User, CreateUserDto, UpdateUserDto } from '../../../../api/services/userService';

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