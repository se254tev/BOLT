const StatisticCard = ({ title, value }) => (
  <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
    <p className="text-sm text-gray-500">{title}</p>
    <p className="mt-4 text-3xl font-semibold text-black">{value}</p>
  </div>
);

export default StatisticCard;
