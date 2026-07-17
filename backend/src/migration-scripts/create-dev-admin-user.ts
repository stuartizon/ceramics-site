import { MedusaContainer } from "@medusajs/framework";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { createUsersWorkflow } from "@medusajs/medusa/core-flows";

const DEV_ADMIN_EMAIL = "admin@example.com";
const DEV_ADMIN_PASSWORD = "password";

export default async function create_dev_admin_user({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);

  // Never create the well-known admin/password login outside local development.
  if (process.env.NODE_ENV !== "development") {
    logger.info(
      "Skipping dev admin user creation (NODE_ENV is not 'development')."
    );
    return;
  }

  const userModuleService = container.resolve(Modules.USER);
  const authModuleService = container.resolve(Modules.AUTH);

  const existingUsers = await userModuleService.listUsers({
    email: DEV_ADMIN_EMAIL,
  });
  if (existingUsers.length > 0) {
    logger.info(`Dev admin user ${DEV_ADMIN_EMAIL} already exists, skipping.`);
    return;
  }

  logger.info(`Creating dev admin user ${DEV_ADMIN_EMAIL}...`);

  const {
    result: [user],
  } = await createUsersWorkflow(container).run({
    input: { users: [{ email: DEV_ADMIN_EMAIL }] },
  });

  const { authIdentity, error } = await authModuleService.register(
    "emailpass",
    {
      body: {
        email: DEV_ADMIN_EMAIL,
        password: DEV_ADMIN_PASSWORD,
      },
    }
  );

  if (error) {
    throw new Error(`Failed to register dev admin auth identity: ${error}`);
  }

  await authModuleService.updateAuthIdentities({
    id: authIdentity!.id,
    app_metadata: {
      user_id: user.id,
    },
  });

  logger.info(
    `Dev admin user ready - email: ${DEV_ADMIN_EMAIL}, password: ${DEV_ADMIN_PASSWORD}`
  );
}
