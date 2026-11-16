import type { SkillGroup } from "../data/content";

export default function SkillGroups({ groups }: { groups: SkillGroup[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {groups.map((group) => (
        <section key={group.title} className="border border-line bg-surface/40 p-6">
          <h3 className="text-2xl">{group.title}</h3>
          <ul className="mt-4 flex flex-wrap gap-2">
            {group.items.map((item) => (
              <li key={item} className="border border-gold/40 px-3 py-1 text-xs tracking-wide text-ivory/80">
                {item}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}