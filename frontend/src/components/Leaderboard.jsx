import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Badge,
  Avatar,
  Group,
  Text,
  Loader,
  Center,
  Title,
  ThemeIcon,
  Progress,
  Pagination,
  Stack,
} from "@mantine/core";
import { IconTrophy, IconMedal2, IconMedal } from "@tabler/icons-react";
import { candidateService } from "../services/api";

const getMedalIcon = (rank) => {
  if (rank === 1) return <IconTrophy size={20} />;
  if (rank === 2) return <IconMedal2 size={20} />;
  if (rank === 3) return <IconMedal size={20} />;
  return rank;
};

const getMedalColor = (rank) => {
  if (rank === 1) return "gold";
  if (rank === 2) return "gray";
  if (rank === 3) return "orange";
  return "blue";
};

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const formatScore = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed.toFixed(1) : "N/A";
};

export function Leaderboard({ compact = false }) {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    loadLeaderboard();
  }, [page]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      if (compact) {
        const response = await candidateService.getTopLeaderboard();
        setData(response.data);
      } else {
        const response = await candidateService.getLeaderboard(page, 20);
        setData(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Failed to load leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  return (
    <Stack spacing="md">
      {!compact && <Title order={2}>🏆 Candidate Leaderboard</Title>}

      <div style={{ overflowX: "auto" }}>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: 60 }}>Rank</Table.Th>
              <Table.Th>Candidate</Table.Th>
              <Table.Th>Primary Skill</Table.Th>
              <Table.Th align="right">Overall Score</Table.Th>
              {!compact && (
                <>
                  <Table.Th align="right">Crisis</Table.Th>
                  <Table.Th align="right">Sustainability</Table.Th>
                  <Table.Th align="right">Team</Table.Th>
                </>
              )}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data.map((candidate) => (
              <Table.Tr
                key={candidate.id}
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`/candidates/${candidate.id}`)}
              >
                <Table.Td>
                  <ThemeIcon
                    color={getMedalColor(toNumber(candidate.rank, 0))}
                    variant="filled"
                    radius="md"
                    size="lg"
                  >
                    {getMedalIcon(toNumber(candidate.rank, 0))}
                  </ThemeIcon>
                </Table.Td>
                <Table.Td>
                  <Group gap="sm">
                    <Avatar
                      src={candidate.avatar_url}
                      size={40}
                      radius="md"
                      name={`${candidate.first_name} ${candidate.last_name}`}
                    />
                    <div>
                      <Text size="sm" fw={500}>
                        {candidate.first_name} {candidate.last_name}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {candidate.location}
                      </Text>
                    </div>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Badge size="sm" variant="light">
                    {candidate.primary_skill}
                  </Badge>
                </Table.Td>
                <Table.Td align="right">
                  <Text fw={700} size="sm">
                    {formatScore(candidate.overall_score)}
                  </Text>
                  <Progress
                    value={(toNumber(candidate.overall_score, 0) / 100) * 100}
                    size="xs"
                  />
                </Table.Td>
                {!compact && (
                  <>
                    <Table.Td align="right">
                      {formatScore(candidate.crisis_score)}
                    </Table.Td>
                    <Table.Td align="right">
                      {formatScore(candidate.sustainability_score)}
                    </Table.Td>
                    <Table.Td align="right">
                      {formatScore(candidate.team_score)}
                    </Table.Td>
                  </>
                )}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </div>

      {!compact && pagination && (
        <Group justify="center" mt="xl">
          <Pagination
            value={page}
            onChange={setPage}
            total={pagination.pages}
            boundaries={1}
            siblings={1}
          />
          <Text size="sm" c="dimmed">
            Showing {data.length} of {pagination.total} candidates
          </Text>
        </Group>
      )}
    </Stack>
  );
}
