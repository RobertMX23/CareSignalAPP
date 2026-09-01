import { useMemo } from 'react';
import { useDemoSession } from '../components/DemoSessionContext';
import { listStaffMembers } from '../data/repository';
import { StaffRosterTable } from '../components/StaffRosterTable';

export const PersonalPage = (): JSX.Element => {
  const { refreshToken } = useDemoSession();

  const staffMembers = useMemo(() => listStaffMembers(), [refreshToken]);

  return (
    <section>
      <h1>Plantilla de personal</h1>
      <StaffRosterTable staffMembers={staffMembers} />
    </section>
  );
};
