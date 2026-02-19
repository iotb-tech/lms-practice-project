import Role from '../models/Role.js';
import permissionSchema from '../models/Permission.js'
import { AppError } from '../utils/AppError.js';

export const getRolesService = async () => {
  const roles = await Role.find({})
    .populate({
      path: 'permissions',
      model: 'Permission',
      select: 'name description'
    })
    .lean();
  
  return roles.map(role => ({
    id: role._id.toString(),
    name: role.name,
    description: role.description || '',
    permissions: role.permissions?.map(p => ({
      id: p._id.toString(),
      name: p.name,
      description: p.description || ''
    })) || []
  }));
};
