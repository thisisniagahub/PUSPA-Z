export interface DashboardMetrics {
  totalMembers: number
  activeCases: number
  totalDonations: number
  totalDisbursements: number
  activeProgrammes: number
  totalVolunteers: number
  complianceScore: number
  pendingEkyc: number
}

export interface MonthlyDonationTrend {
  month: string
  zakat: number
  sadaqah: number
  waqf: number
  infaq: number
  general: number
}

export interface MemberBreakdown {
  category: string
  count: number
}

export interface RecentActivity {
  id: string
  type: string
  title: string
  description?: string
  createdAt: string
  category: string
}

export interface Member {
  id: string
  icNumber: string
  name: string
  phone?: string
  email?: string
  address?: string
  city?: string
  state?: string
  postcode?: string
  gender?: string
  dateOfBirth?: string
  occupation?: string
  monthlyIncome: number
  householdSize: number
  asnafCategory: string
  status: string
  ekycStatus: string
  createdAt: string
  updatedAt: string
}

export interface Case {
  id: string
  caseNumber: string
  memberId: string
  memberName?: string
  type: string
  priority: string
  status: string
  description?: string
  requestedAmount?: number
  approvedAmount?: number
  riskIndicator?: string
  welfareScore?: number
  nextAction?: string
  createdAt: string
  updatedAt: string
}

export interface Donation {
  id: string
  donorId?: string
  donorName?: string
  category: string
  amount: number
  currency: string
  method?: string
  receiptNumber?: string
  receiptIssued: boolean
  shariahCompliant: boolean
  date?: string
  createdAt: string
}

export interface Donor {
  id: string
  name: string
  email?: string
  phone?: string
  type: string
  category?: string
  totalDonated?: number
  donationCount?: number
  createdAt: string
}

export interface Disbursement {
  id: string
  memberId: string
  memberName?: string
  caseId?: string
  programmeId?: string
  amount: number
  category: string
  status: string
  paymentMethod?: string
  paymentRef?: string
  scheduledDate?: string
  disbursedDate?: string
  createdAt: string
}

export interface Programme {
  id: string
  name: string
  description?: string
  category: string
  status: string
  budget: number
  spent: number
  startDate?: string
  endDate?: string
  targetBeneficiaries: number
  createdAt: string
}

export interface Volunteer {
  id: string
  name: string
  email?: string
  phone?: string
  skills?: string
  availability?: string
  status: string
  totalHours: number
  joinedAt?: string
  createdAt: string
}

export interface ComplianceRecord {
  id: string
  category: string
  title: string
  description?: string
  status: string
  dueDate?: string
  completedAt?: string
  evidenceUrl?: string
  assignedTo?: string
  createdAt: string
}

export interface EKYCVerification {
  id: string
  memberId: string
  memberName?: string
  riskLevel: string
  status: string
  faceMatchScore?: number
  verifiedBy?: string
  verifiedAt?: string
  createdAt: string
}

export interface Document {
  id: string
  title: string
  category: string
  fileName?: string
  fileSize?: number
  version: number
  tags?: string
  createdAt: string
}

export interface Activity {
  id: string
  type: string
  category: string
  title: string
  description?: string
  createdAt: string
}

export interface AiMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt: string
}

export interface OpsWorkItem {
  id: string
  title: string
  description?: string
  type: string
  status: string
  priority: string
  createdAt: string
}
