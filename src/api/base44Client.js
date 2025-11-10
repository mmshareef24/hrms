// Local mock Base44 client for running the app without external SDK
// Provides minimal in-memory implementations for auth, entities, integrations, and agents.

const store = new Map();

function getCollection(name) {
  if (!store.has(name)) store.set(name, []);
  return store.get(name);
}

function sortAndLimit(items, sortField, limit) {
  let result = [...items];
  if (sortField && typeof sortField === 'string') {
    const desc = sortField.startsWith('-');
    const field = desc ? sortField.slice(1) : sortField;
    result.sort((a, b) => {
      const av = a?.[field];
      const bv = b?.[field];
      if (av === bv) return 0;
      return (av > bv ? 1 : -1) * (desc ? -1 : 1);
    });
  }
  if (typeof limit === 'number') result = result.slice(0, limit);
  return result;
}

function matches(item, query) {
  if (!query || typeof query !== 'object') return true;
  return Object.entries(query).every(([k, v]) => {
    const iv = item?.[k];
    if (v && typeof v === 'object' && 'in' in v && Array.isArray(v.in)) {
      return v.in.includes(iv);
    }
    return iv === v;
  });
}

let nextId = 1;
function genId() {
  return `${Date.now()}_${nextId++}`;
}

class LocalEntity {
  constructor(name) {
    this.name = name;
  }
  async list(sortField, limit) {
    const col = getCollection(this.name);
    return sortAndLimit(col, sortField, limit);
  }
  async filter(query, sortField, limit) {
    const col = getCollection(this.name);
    const filtered = col.filter((item) => matches(item, query));
    return sortAndLimit(filtered, sortField, limit);
  }
  async create(data) {
    const col = getCollection(this.name);
    const id = data?.id ?? genId();
    const now = new Date().toISOString();
    const record = { id, created_date: now, ...data };
    col.unshift(record);
    return record;
  }
  async bulkCreate(items) {
    const created = [];
    for (const it of items ?? []) {
      created.push(await this.create(it));
    }
    return created;
  }
  async update(id, data) {
    const col = getCollection(this.name);
    const idx = col.findIndex((x) => x.id === id);
    if (idx === -1) throw new Error(`Record not found in ${this.name}: ${id}`);
    const now = new Date().toISOString();
    col[idx] = { ...col[idx], ...data, updated_date: now };
    return col[idx];
  }
  async delete(id) {
    const col = getCollection(this.name);
    const idx = col.findIndex((x) => x.id === id);
    if (idx !== -1) col.splice(idx, 1);
    return { ok: true };
  }
}

const entities = new Proxy({}, {
  get(_, prop) {
    if (typeof prop !== 'string') return undefined;
    return new LocalEntity(prop);
  }
});

// Seed minimal demo data to keep ESS/Administration pages functional
const defaultUser = {
  id: 'user_1',
  email: 'user@local.test',
  work_email: 'user@local.test',
  full_name: 'Local User',
  manager_name: 'Manager Local',
  status: 'Active',
  role: 'Admin'
};

// Companies
getCollection('Company').push(
  { id: 'C1', company_code: 'JASCO01', company_name: 'Al Jazeera Steel', is_active: true },
  { id: 'C2', company_code: 'JASCO02', company_name: 'JASCO Manufacturing', is_active: true }
);

// Shifts
getCollection('Shift').push(
  { id: 'S1', shift_name: 'General Shift', is_active: true },
  { id: 'S2', shift_name: 'Night Shift', is_active: true }
);

// Employees
getCollection('Employee').push(
  {
    id: 'EMP001',
    employee_id: 'EMP001',
    full_name: 'John Doe',
    full_name_arabic: 'جون دو',
    nationality: 'Non-Saudi',
    country_of_origin: 'USA',
    work_email: 'john@example.com',
    mobile: '+966501234567',
    department: 'IT',
    job_title: 'Software Engineer',
    employment_type: 'Permanent',
    join_date: '2024-01-15',
    company_id: 'C1',
    company_name: 'Al Jazeera Steel',
    shift_id: 'S1',
    shift_name: 'General Shift',
    manager_id: 'EMP002',
    manager_name: 'Ahmed Ali',
    status: 'Active',
    basic_salary: 8000,
    housing_allowance: 2000,
    transportation_allowance: 800,
    annual_leave_balance: 21,
    sick_leave_balance: 30
  },
  {
    id: 'EMP002',
    employee_id: 'EMP002',
    full_name: 'Ahmed Ali',
    full_name_arabic: 'أحمد علي',
    nationality: 'Saudi',
    work_email: 'ahmed@example.com',
    mobile: '+966501234568',
    department: 'HR',
    job_title: 'HR Manager',
    employment_type: 'Permanent',
    join_date: '2023-05-20',
    company_id: 'C1',
    company_name: 'Al Jazeera Steel',
    shift_id: 'S1',
    shift_name: 'General Shift',
    manager_id: 'EMP003',
    manager_name: 'Fatima Khan',
    status: 'Active',
    basic_salary: 10000,
    housing_allowance: 2500,
    transportation_allowance: 1000,
    annual_leave_balance: 21,
    sick_leave_balance: 30
  },
  {
    id: 'EMP003',
    employee_id: 'EMP003',
    full_name: 'Fatima Khan',
    nationality: 'Non-Saudi',
    work_email: 'fatima@example.com',
    mobile: '+966501234569',
    department: 'Finance',
    job_title: 'Finance Lead',
    employment_type: 'Permanent',
    join_date: '2022-11-01',
    company_id: 'C2',
    company_name: 'JASCO Manufacturing',
    shift_id: 'S2',
    shift_name: 'Night Shift',
    manager_id: 'EMP002',
    manager_name: 'Ahmed Ali',
    status: 'Active',
    basic_salary: 12000,
    housing_allowance: 3000,
    transportation_allowance: 1200,
    annual_leave_balance: 21,
    sick_leave_balance: 30
  }
);

// Default user (for auth.me)
getCollection('Employee').push(defaultUser);
getCollection('LeaveType').push({ id: 'LT1', leave_type_name: 'Annual Leave', is_active: true, leave_category: 'Annual' });

// Expense Claims (demo seed)
getCollection('ExpenseClaim').push(
  {
    id: 'EXP001',
    employee_id: 'EMP001',
    claim_date: new Date().toISOString().slice(0, 10),
    description: 'Business lunch with client',
    status: 'Draft',
    lines: [
      { expense_date: new Date().toISOString().slice(0, 10), category: 'Meals', vendor: 'Al Baik', description: 'Lunch', currency: 'SAR', amount: 85, vat_included: true, receipt_url: '' }
    ],
    lines_count: 1,
    total_amount_sar: 85,
    vat_total_sar: Math.round(85 * 0.15 * 100) / 100
  },
  {
    id: 'EXP002',
    employee_id: 'EMP001',
    claim_date: new Date().toISOString().slice(0, 10),
    description: 'Airport taxi',
    status: 'Submitted',
    lines: [
      { expense_date: new Date().toISOString().slice(0, 10), category: 'Taxi', vendor: 'Careem', description: 'Ride to airport', currency: 'SAR', amount: 120, vat_included: false, receipt_url: '' }
    ],
    lines_count: 1,
    total_amount_sar: 120,
    vat_total_sar: 0
  }
);

const integrationsCore = {
  async SendEmail({ to, subject, body }) {
    console.info('Mock SendEmail:', { to, subject, body });
    return { ok: true };
  },
  async UploadFile({ file }) {
    const file_url = typeof window !== 'undefined' && file ? URL.createObjectURL(file) : '/mock-uploaded-file';
    return { file_url };
  },
  async ExtractDataFromUploadedFile({ file_url }) {
    console.info('Mock ExtractDataFromUploadedFile:', { file_url });
    // Match expected shape in UI: status and output array
    return { status: 'ok', output: [] };
  },
  async GenerateImage({ prompt }) {
    return { image_url: '/mock-generated-image' };
  },
  async CreateFileSignedUrl({ filename }) {
    return { url: `/mock-signed-url/${encodeURIComponent(filename)}` };
  },
  async UploadPrivateFile({ file }) {
    return { ok: true, path: '/mock/private-file' };
  },
  async InvokeLLM({ prompt }) {
    return { text: `Mock AI response for: ${prompt?.slice?.(0, 80) || ''}` };
  }
};

const agents = {
  _conversations: [],
  async listConversations() {
    return this._conversations;
  },
  async createConversation({ title }) {
    const convo = { id: genId(), title: title || 'New Conversation', messages: [] };
    this._conversations.push(convo);
    return convo;
  },
  async getConversation(id) {
    return this._conversations.find((c) => c.id === id) || null;
  },
  async addMessage(conversation, { role, content }) {
    const convo = typeof conversation === 'object' ? conversation : await this.getConversation(conversation);
    if (!convo) throw new Error('Conversation not found');
    const msg = { id: genId(), role: role || 'user', content, created_date: new Date().toISOString() };
    convo.messages.push(msg);
    if (typeof this._subscriber === 'function') this._subscriber({ conversation: convo, message: msg });
    return msg;
  },
  subscribeToConversation(id, cb) {
    this._subscriber = (data) => {
      if (data.conversation?.id === id) cb(data);
    };
    return () => { this._subscriber = null; };
  }
};

export const base44 = {
  auth: {
    async me() {
      try {
        const raw = typeof window !== 'undefined' ? window.localStorage.getItem('matrixUser') : null;
        const parsed = raw ? JSON.parse(raw) : null;
        return parsed || defaultUser;
      } catch {
        return defaultUser;
      }
    },
    async logout() {
      try {
        if (typeof window !== 'undefined') window.localStorage.removeItem('matrixUser');
      } catch {}
      return { ok: true };
    }
  },
  entities,
  integrations: {
    Core: integrationsCore
  },
  agents
};
