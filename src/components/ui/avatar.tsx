const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-purple-500",
  "bg-teal-500",
  "bg-red-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-indigo-500",
  "bg-cyan-500",
  "bg-violet-500",
  "bg-fuchsia-500",
  "bg-rose-500",
  "bg-lime-500",
  "bg-sky-500",
  "bg-yellow-500",
  "bg-green-500",
  "bg-slate-500",
  "bg-gray-500",
];

function colorForUsername(username: string) {
  let hash = 0;
  for (const char of username) {
    hash = (char.codePointAt(0) ?? 0) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

interface AvatarProps {
  nom: string;
  prenom: string;
  username: string;
  avatar: string | null;
}

function Avatar(props: Readonly<AvatarProps>){
  if (props.avatar) {
    return (
      <img
        src={props.avatar}
        alt={props.prenom + " " + props.nom}
        className="h-9 w-9 flex-shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <div
      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${colorForUsername(props.username)}`}
    >
      {props.username.charAt(0).toUpperCase()}
    </div>
  );
}
Avatar.displayName = "Avatar";

export { Avatar };
