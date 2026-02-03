import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import {
  AppShell,
  Group,
  Container,
  Burger,
  Drawer,
  Stack,
  Text,
  ThemeIcon,
  Anchor,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconBrandGithub, IconMail, IconBook } from "@tabler/icons-react";
import "@mantine/core/styles.css";
import { Dashboard } from "./pages/Dashboard";
import { SharedProfile } from "./pages/SharedProfile";
import { CandidateProfile } from "./pages/CandidateProfile";

function App() {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
    useDisclosure(false);

  return (
    <MantineProvider>
      <BrowserRouter>
        <AppShell
          header={{ height: 70 }}
          navbar={{
            width: 250,
            breakpoint: "sm",
            collapsed: { mobile: !drawerOpened },
          }}
        >
          <AppShell.Header height={70} p="md">
            <Container size="xl" h="100%">
              <Group justify="space-between" h="100%">
                <Group gap="lg">
                  <Burger
                    opened={drawerOpened}
                    onClick={toggleDrawer}
                    hiddenFrom="sm"
                  />
                  <ThemeIcon variant="light" size="lg" radius="md" color="blue">
                    🎯
                  </ThemeIcon>
                  <div>
                    <Text fw={700} size="lg">
                      Evaluator
                    </Text>
                    <Text size="xs" c="dimmed">
                      Talent Assessment Platform
                    </Text>
                  </div>
                </Group>

                <Group gap="md" hiddenFrom="sm">
                  <Anchor href="/" c="gray" fw={500} size="sm">
                    Dashboard
                  </Anchor>
                  <Anchor href="#" c="gray" fw={500} size="sm">
                    Docs
                  </Anchor>
                </Group>
              </Group>
            </Container>
          </AppShell.Header>

          <AppShell.Navbar p="md">
            <Stack spacing="lg">
              <div>
                <Text fw={600} size="sm" mb="xs" c="dimmed">
                  NAVIGATION
                </Text>
                <Stack spacing="xs">
                  <Anchor
                    component={Link}
                    to="/"
                    c="blue"
                    fw={500}
                    onClick={closeDrawer}
                  >
                    🏠 Overview
                  </Anchor>
                  <Anchor
                    component={Link}
                    to="/leaderboard"
                    c="blue"
                    fw={500}
                    onClick={closeDrawer}
                  >
                    🏆 Leaderboard
                  </Anchor>
                  <Anchor
                    component={Link}
                    to="/analytics"
                    c="blue"
                    fw={500}
                    onClick={closeDrawer}
                  >
                    📊 Analytics
                  </Anchor>
                </Stack>
              </div>
            </Stack>

            {/* <div
                style={{
                  marginTop: "auto",
                  paddingTop: "20px",
                  borderTop: "1px solid #e9ecef",
                }}
              >
                <Text fw={600} size="sm" mb="xs" c="dimmed">
                  RESOURCES
                </Text>
                <Stack spacing="xs">
                  <Group gap="xs" align="center">
                    <IconBrandGithub size={16} />
                    <Anchor
                      href="https://github.com"
                      target="_blank"
                      size="sm"
                      fw={500}
                    >
                      GitHub
                    </Anchor>
                  </Group>
                  <Group gap="xs" align="center">
                    <IconMail size={16} />
                    <Anchor
                      href="mailto:support@evaluator.dev"
                      size="sm"
                      fw={500}
                    >
                      Support
                    </Anchor>
                  </Group>
                  <Group gap="xs" align="center">
                    <IconBook size={16} />
                    <Anchor href="#docs" size="sm" fw={500}>
                      API Docs
                    </Anchor>
                  </Group>
                </Stack>
              </div>
            </Stack> */}

            {/* <Drawer
              opened={drawerOpened}
              onClose={closeDrawer}
              title="Navigation"
              size="sm"
              hiddenFrom="sm"
            >
              <Stack spacing="lg">
                <Anchor href="/" fw={500} onClick={closeDrawer}>
                  Dashboard
                </Anchor>
                <Anchor href="#" fw={500} onClick={closeDrawer}>
                  Analytics
                </Anchor>
                <Anchor href="#" fw={500} onClick={closeDrawer}>
                  Documentation
                </Anchor>
              </Stack>
            </Drawer> */}
          </AppShell.Navbar>

          <AppShell.Main>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route
                path="/leaderboard"
                element={<Dashboard defaultTab="leaderboard" />}
              />
              <Route
                path="/analytics"
                element={<Dashboard defaultTab="analytics" />}
              />
              <Route path="/candidates/:id" element={<CandidateProfile />} />
              <Route path="/share/:token" element={<SharedProfile />} />
            </Routes>
          </AppShell.Main>
        </AppShell>
      </BrowserRouter>
    </MantineProvider>
  );
}

export default App;
