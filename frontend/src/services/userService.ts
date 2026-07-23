export interface CurrentUser {
  id: number;
  name: string;
  email: string;
  username: string;
  role: string;
  job_title?: string;
  phone?: string;
  avatarUrl?: string;
  customer?: any; 
  permissions?: string[];
}

export interface AvatarResult {
  url: string;
  fileName: string;
  provider: string;
  uploadedAt: string;
}

export interface PasswordUpdateData {
  current_password: string;
  new_password: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

const getHeaders = () => {
  return {
    "Content-Type": "application/json",
  };
};

export const userService = {
  async getCurrentUser(): Promise<CurrentUser> {
    const res = await fetch(`${API_URL}/users/me`, {
      method: "GET",
      headers: getHeaders(),
      credentials: "include",
    });
    if (!res.ok) {
      if (res.status === 401) throw new Error("Unauthorized");
      throw new Error("Failed to fetch user");
    }
    const data = await res.json();
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      username: data.username,
      role: data.role,
      job_title: data.job_title,
      phone: data.phone,
      avatarUrl: data.avatar_url,
    };
  },

  async updatePassword(data: PasswordUpdateData): Promise<{ message: string }> {
    const res = await fetch(`${API_URL}/users/me/password`, {
      method: "PATCH",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.detail || "Failed to update password");
    return result;
  },

  async uploadAvatar(file: File): Promise<AvatarResult> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_URL}/users/me/avatar`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.detail || "Failed to upload avatar");
    return result;
  },

  async updateUserAdmin(userId: number, data: Partial<CurrentUser>): Promise<CurrentUser> {
    const payload = {
        name: data.name,
        email: data.email,
        job_title: data.job_title,
        phone: data.phone,
        role: data.role
    };

    const res = await fetch(`${API_URL}/admin/users/${userId}`, {
      method: "PATCH",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.detail || "Failed to update user");
    return {
      id: result.id,
      name: result.name,
      email: result.email,
      username: result.username,
      role: result.role,
      job_title: result.job_title,
      phone: result.phone,
      avatarUrl: result.avatar_url,
    };
  }
};
