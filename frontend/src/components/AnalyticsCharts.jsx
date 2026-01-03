export default function AnalyticsCharts({ data }) {
  return (
    <ul>
      {data.map(d => (
        <li key={d._id}>{d._id} : {d.count}</li>
      ))}
    </ul>
  );
}
