import { Injectable, signal } from '@angular/core';

export interface OrganizationRecord {
  name: string;
  code: string;
  industry: string;
  email: string;
  phone: string;
  address: string;
  employees: number;
}

@Injectable({
  providedIn: 'root',
})
export class OrganizationService {
  private readonly storageKey =
    'worksphere_organization';

  private readonly organization =
    signal<OrganizationRecord>(
      this.loadOrganization(),
    );

  readonly organizationData =
    this.organization.asReadonly();

  updateOrganization(
    updates: Omit<OrganizationRecord, 'employees'>,
  ): void {
    this.organization.update((organization) => {
      const updatedOrganization: OrganizationRecord = {
        ...organization,
        ...updates,
      };

      this.saveOrganization(updatedOrganization);

      return updatedOrganization;
    });
  }

  private loadOrganization(): OrganizationRecord {
    const storedOrganization = localStorage.getItem(
      this.storageKey,
    );

    if (!storedOrganization) {
      return this.getDefaultOrganization();
    }

    try {
      const parsedOrganization = JSON.parse(
        storedOrganization,
      );

      if (
        parsedOrganization &&
        typeof parsedOrganization === 'object' &&
        !Array.isArray(parsedOrganization)
      ) {
        return parsedOrganization as OrganizationRecord;
      }
    } catch {
      // Fall back to the default demo data.
    }

    return this.getDefaultOrganization();
  }

  private saveOrganization(
    organization: OrganizationRecord,
  ): void {
    localStorage.setItem(
      this.storageKey,
      JSON.stringify(organization),
    );
  }

  private getDefaultOrganization(): OrganizationRecord {
    return {
      name: 'WorkSphere Technologies',
      code: 'WS-ORG-001',
      industry: 'Software & Technology',
      email: 'admin@worksphere.example',
      phone: '+91 98765 43210',
      address: 'Bhubaneswar, Odisha, India',
      employees: 128,
    };
  }
}
