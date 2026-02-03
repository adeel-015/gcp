import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  Text,
  Badge,
  Button,
  Group,
  Avatar,
  Stack,
  Grid,
  Loader,
  Center,
  Progress,
  ActionIcon,
  Modal,
  CopyButton,
  Tooltip,
} from "@mantine/core";
import {
  IconShare2,
  IconCheck,
  IconLink,
  IconMapPin,
} from "@tabler/icons-react";
import { candidateService } from "../services/api";

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const formatScore = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed.toFixed(1) : "N/A";
};

const formatPhone = (value) => {
  if (!value) return "";
  const hasPlus = String(value).trim().startsWith("+");
  const digits = String(value).replace(/\D/g, "").slice(0, 10);
  if (!digits) return "";
  return hasPlus ? `+${digits}` : digits;
};

const phoneHref = (value) => {
  const formatted = formatPhone(value);
  return formatted ? `tel:${formatted}` : "";
};

export function CandidateCard({ candidate, onShare }) {
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    setSharing(true);
    try {
      const response = await candidateService.shareCandidateProfile(
        candidate.id,
      );
      setShareUrl(response.data.shareUrl);
      setShareModalOpen(true);
      onShare?.(candidate.id, response.data.shareUrl);
    } catch (error) {
      console.error("Failed to generate share link:", error);
    } finally {
      setSharing(false);
    }
  };

  const crisisScore = candidate.ranking?.crisis_score || 0;
  const sustainabilityScore = candidate.ranking?.sustainability_score || 0;
  const teamScore = candidate.ranking?.team_score || 0;

  return (
    <>
      <Card
        shadow="sm"
        padding="lg"
        radius="md"
        withBorder
        h="100%"
        component={Link}
        to={`/candidates/${candidate.id}`}
        style={{ cursor: "pointer", textDecoration: "none", color: "inherit" }}
      >
        <Card.Section inheritPadding py="md">
          <Group justify="space-between">
            <Group gap="md">
              <Avatar
                src={candidate.avatar_url}
                size={60}
                radius="md"
                name={`${candidate.first_name} ${candidate.last_name}`}
              />
              <div>
                <Text fw={600} size="sm">
                  {candidate.first_name} {candidate.last_name}
                </Text>
                {candidate.ranking && (
                  <Badge size="sm" color="blue">
                    #{toNumber(candidate.ranking.rank, 0)} -{" "}
                    {formatScore(candidate.ranking.overall_score)} pts
                  </Badge>
                )}
              </div>
            </Group>
          </Group>
        </Card.Section>

        <Stack spacing="sm" mt="md">
          <div>
            <Text size="xs" fw={500} c="dimmed" mb="xs">
              Primary Skill
            </Text>
            <Badge size="md" variant="light">
              {candidate.primary_skill}
            </Badge>
          </div>

          {candidate.secondary_skills &&
            candidate.secondary_skills.length > 0 && (
              <div>
                <Text size="xs" fw={500} c="dimmed" mb="xs">
                  Secondary Skills
                </Text>
                <Group gap="xs">
                  {candidate.secondary_skills.slice(0, 3).map((skill, idx) => (
                    <Badge key={idx} size="sm" variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </Group>
              </div>
            )}

          {candidate.location && (
            <Group gap="xs" align="center">
              <IconMapPin size={16} stroke={1.5} />
              <Text size="sm">{candidate.location}</Text>
            </Group>
          )}

          {candidate.years_experience && (
            <Text size="sm" c="dimmed">
              💼 {candidate.years_experience} years of experience
            </Text>
          )}

          {candidate.bio && (
            <div>
              <Text size="xs" fw={500} c="dimmed" mb="xs">
                Bio
              </Text>
              <Text size="sm" lineClamp={3}>
                {candidate.bio}
              </Text>
            </div>
          )}

          {candidate.evaluations && candidate.evaluations.length > 0 && (
            <div>
              <Text size="xs" fw={500} c="dimmed" mb="xs">
                Evaluation Scores
              </Text>
              <Stack spacing="xs">
                {crisisScore > 0 && (
                  <div>
                    <Group justify="space-between" mb="xs">
                      <Text size="xs">Crisis</Text>
                      <Text size="xs" fw={700}>
                        {formatScore(crisisScore)}
                      </Text>
                    </Group>
                    <Progress
                      value={(toNumber(crisisScore, 0) / 100) * 100}
                      size="xs"
                    />
                  </div>
                )}
                {sustainabilityScore > 0 && (
                  <div>
                    <Group justify="space-between" mb="xs">
                      <Text size="xs">Sustainability</Text>
                      <Text size="xs" fw={700}>
                        {formatScore(sustainabilityScore)}
                      </Text>
                    </Group>
                    <Progress
                      value={(toNumber(sustainabilityScore, 0) / 100) * 100}
                      size="xs"
                      color="teal"
                    />
                  </div>
                )}
                {teamScore > 0 && (
                  <div>
                    <Group justify="space-between" mb="xs">
                      <Text size="xs">Team Building</Text>
                      <Text size="xs" fw={700}>
                        {formatScore(teamScore)}
                      </Text>
                    </Group>
                    <Progress
                      value={(toNumber(teamScore, 0) / 100) * 100}
                      size="xs"
                      color="orange"
                    />
                  </div>
                )}
              </Stack>
            </div>
          )}

          <Group gap="xs" mt="auto">
            {candidate.linkedin_url && (
              <Tooltip label="LinkedIn Profile">
                <ActionIcon
                  variant="light"
                  component="a"
                  href={candidate.linkedin_url}
                  target="_blank"
                  size="lg"
                >
                  💼
                </ActionIcon>
              </Tooltip>
            )}
            {candidate.github_url && (
              <Tooltip label="GitHub Profile">
                <ActionIcon
                  variant="light"
                  component="a"
                  href={candidate.github_url}
                  target="_blank"
                  size="lg"
                >
                  💻
                </ActionIcon>
              </Tooltip>
            )}
            {candidate.website_url && (
              <Tooltip label="Website">
                <ActionIcon
                  variant="light"
                  component="a"
                  href={candidate.website_url}
                  target="_blank"
                  size="lg"
                >
                  🌐
                </ActionIcon>
              </Tooltip>
            )}
            {candidate.phone && formatPhone(candidate.phone) && (
              <Tooltip label={formatPhone(candidate.phone)}>
                <ActionIcon
                  variant="light"
                  component="a"
                  href={phoneHref(candidate.phone)}
                  size="lg"
                >
                  ☎️
                </ActionIcon>
              </Tooltip>
            )}
          </Group>

          <Button
            leftSection={<IconShare2 size={16} />}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleShare();
            }}
            loading={sharing}
            fullWidth
            variant="light"
          >
            Share Profile
          </Button>
        </Stack>
      </Card>

      <Modal
        opened={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title="Share Candidate Profile"
        size="sm"
      >
        <Stack spacing="md">
          <div>
            <Text size="sm" fw={500} mb="xs">
              Profile Link
            </Text>
            <Group gap="xs">
              <code
                style={{
                  flex: 1,
                  padding: "8px",
                  backgroundColor: "#f1f3f5",
                  borderRadius: "4px",
                  fontSize: "12px",
                  wordBreak: "break-all",
                }}
              >
                {shareUrl}
              </code>
              <CopyButton value={shareUrl} timeout={2000}>
                {({ copied, copy }) => (
                  <Tooltip
                    label={copied ? "Copied" : "Copy"}
                    withArrow
                    position="right"
                  >
                    <ActionIcon
                      color={copied ? "teal" : "gray"}
                      variant="light"
                      onClick={copy}
                    >
                      {copied ? (
                        <IconCheck size={16} />
                      ) : (
                        <IconLink size={16} />
                      )}
                    </ActionIcon>
                  </Tooltip>
                )}
              </CopyButton>
            </Group>
          </div>
          <Text size="xs" c="dimmed">
            This link can be shared with others to view {candidate.first_name}'s
            evaluation profile.
          </Text>
        </Stack>
      </Modal>
    </>
  );
}

export function CandidateGrid({ candidates = [], loading = false, onShare }) {
  if (loading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  if (candidates.length === 0) {
    return (
      <Center py="xl">
        <Text c="dimmed">No candidates found</Text>
      </Center>
    );
  }

  return (
    <Grid>
      {candidates.map((candidate) => (
        <Grid.Col key={candidate.id} span={{ base: 12, sm: 6, md: 4 }}>
          <CandidateCard candidate={candidate} onShare={onShare} />
        </Grid.Col>
      ))}
    </Grid>
  );
}
