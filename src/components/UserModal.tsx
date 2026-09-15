import { useState } from 'react';
import type { Role, User } from '../types';

interface Props {
  onClose: () => void;
  onSubmit: (user: {
    email: string;
    password?: string;
    name: string;
    secondname: string;
    roleId: string;
  }) => void;
  roles: Role[];
  user?: User;
}

export default function UserModal({ onClose, onSubmit, roles, user }: Props) {
  const isEditing = Boolean(user);
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(user?.name || '');
  const [secondname, setSecondname] = useState(user?.secondname || '');
  const [roleId, setRoleId] = useState(user?.roleId || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ email, password: password || undefined, name, secondname, roleId });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {isEditing ? 'Modificar Usuario' : 'Crear Usuario'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
          <input
            type="text"
            placeholder="Apellido"
            value={secondname}
            onChange={(e) => setSecondname(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
          <input
            type="password"
            placeholder={isEditing ? 'Contraseña (opcional)' : 'Contraseña'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required={!isEditing}
          />
          <select
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          >
            <option value="">Seleccionar rol</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.nombre}
              </option>
            ))}
          </select>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
              {isEditing ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
