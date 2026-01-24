import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import {
  ProfileContainer,
  AvatarWrapper,
  ProfileInfo,
  UserName,
  UserEmail,
  MemberSince,
  EditButton,
} from './ProfileSection.styles';

interface ProfileSectionProps {
  user: {
    name: string;
    email: string;
    joinedDate: string;
  };
  onEdit: () => void;
}

const ProfileSection = ({ user, onEdit }: ProfileSectionProps) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <ProfileContainer>
      <AvatarWrapper>
        {user.name ? getInitials(user.name) : <PersonIcon sx={{ fontSize: 32 }} />}
      </AvatarWrapper>
      <ProfileInfo>
        <UserName>{user.name}</UserName>
        <UserEmail>{user.email}</UserEmail>
        <MemberSince>Member since {user.joinedDate}</MemberSince>
      </ProfileInfo>
      <EditButton onClick={onEdit}>
        <EditIcon sx={{ fontSize: 14 }} />
        Edit Profile
      </EditButton>
    </ProfileContainer>
  );
};

export default ProfileSection;
