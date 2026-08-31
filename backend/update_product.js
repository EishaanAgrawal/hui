const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const product = await prisma.product.update({
    where: { id: 'cd46716b-97db-4f8f-b85a-16d84a00a0ec' },
    data: {
      bulkPricingEnabled: true,
      bulkMinimumQuantity: 100,
      bulkPrice: 38
    }
  });
  console.log('Updated:', product.name, 'BulkEnabled:', product.bulkPricingEnabled);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
