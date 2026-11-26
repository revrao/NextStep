export function Illustration({
  kind = "garden",
  className = "",
}: {
  kind?: string;
  className?: string;
}) {
  const variant =
    kind === "language"
      ? "book"
      : kind === "fine-motor"
        ? "blocks"
        : kind === "gross-motor"
          ? "ball"
          : kind === "cognitive"
            ? "shapes"
            : kind === "social"
              ? "friends"
              : kind;
  return (
    <svg
      className={className}
      viewBox="0 0 440 300"
      fill="none"
      aria-hidden="true"
    >
      {variant === "garden" ? (
        <>
          <path
            d="M36 267C76 217 119 247 151 224C208 181 233 228 278 203C326 175 380 214 414 267"
            fill="#D9E4D6"
          />
          <path
            d="M207 252V117M207 187C163 184 141 158 150 136C182 131 206 151 207 187ZM209 156C214 117 245 104 267 112C268 140 243 157 209 156Z"
            stroke="#597A55"
            strokeWidth="7"
            strokeLinecap="round"
            fill="#91AA7F"
          />
          <path
            d="M100 257V186M100 222C66 223 58 202 63 188C86 187 99 200 100 222ZM102 204C108 177 128 168 145 176C144 196 126 205 102 204Z"
            stroke="#78926A"
            strokeWidth="5"
            fill="#B4C5A1"
          />
          <path
            d="M301 259V176M302 219C330 213 345 191 333 176C310 179 300 198 302 219Z"
            stroke="#597A55"
            strokeWidth="5"
            fill="#91AA7F"
          />
          <circle cx="207" cy="86" r="31" fill="#E7AD86" />
          <circle cx="185" cy="102" r="25" fill="#E7AD86" />
          <circle cx="228" cy="104" r="25" fill="#E7AD86" />
          <circle cx="207" cy="107" r="14" fill="#F8DBA0" />
          <circle cx="338" cy="63" r="29" fill="#EED79F" />
          <path
            d="M338 21V12M376 43L385 37M298 43L289 37M339 107V116"
            stroke="#E0C182"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M278 111C286 93 299 97 302 105C313 97 326 111 314 120C304 127 290 119 278 111Z"
            fill="#C4B6D6"
          />
          <path
            d="M54 109C66 98 79 98 89 108M66 114C76 107 87 108 94 115"
            stroke="#8FA39A"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path d="M151 256H264L252 293H163L151 256Z" fill="#C97F61" />
          <path d="M145 253H270V264H145Z" fill="#D99272" />
          <path d="M318 254H359V275H318Z" fill="#D9B378" />
          <path d="M330 231H371V252H330Z" fill="#B9C9BA" />
        </>
      ) : variant === "book" ? (
        <>
          <ellipse cx="221" cy="250" rx="132" ry="14" fill="#E5CDB5" />
          <path
            d="M218 90C174 59 125 69 94 84V224C137 207 180 214 218 240V90Z"
            fill="#FDF9EE"
            stroke="#B47E5F"
            strokeWidth="5"
          />
          <path
            d="M222 90C266 59 315 69 346 84V224C303 207 260 214 222 240V90Z"
            fill="#FFFCF5"
            stroke="#B47E5F"
            strokeWidth="5"
          />
          <path d="M221 92V236" stroke="#C2A184" strokeWidth="4" />
          <circle cx="157" cy="132" r="22" fill="#D8AC6D" />
          <path
            d="M133 171H182M133 185H171M261 174H309M261 188H293"
            stroke="#D2BBA0"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path d="M284 107L309 147H259L284 107Z" fill="#93AD86" />
          <path
            d="M349 45L355 59M364 70L379 75M340 37L335 28"
            stroke="#B99466"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </>
      ) : variant === "blocks" ? (
        <>
          <ellipse cx="223" cy="257" rx="126" ry="12" fill="#CFDAC9" />
          <rect
            x="104"
            y="166"
            width="76"
            height="76"
            rx="8"
            fill="#A8BC94"
            transform="rotate(-8 104 166)"
          />
          <rect x="193" y="173" width="77" height="77" rx="8" fill="#E2B585" />
          <rect
            x="280"
            y="161"
            width="76"
            height="76"
            rx="8"
            fill="#91AAA1"
            transform="rotate(7 280 161)"
          />
          <rect
            x="181"
            y="90"
            width="77"
            height="77"
            rx="8"
            fill="#D3A18B"
            transform="rotate(7 181 90)"
          />
          <path
            d="M128 195L151 220M153 194L130 220M218 119H237M228 109V130M217 211H246"
            stroke="#FFF7E8"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <circle cx="310" cy="201" r="18" stroke="#E8F0DF" strokeWidth="5" />
        </>
      ) : variant === "ball" ? (
        <>
          <ellipse cx="225" cy="254" rx="130" ry="13" fill="#D4DCCF" />
          <circle cx="220" cy="155" r="88" fill="#D9A17E" />
          <path
            d="M151 102C220 127 232 184 215 242M234 69C202 112 178 173 151 218M304 146C247 130 183 154 141 191"
            stroke="#FAE3BB"
            strokeWidth="7"
          />
          <path
            d="M93 139L72 145M107 99L89 88M333 198L358 208"
            stroke="#99AD8E"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </>
      ) : variant === "friends" ? (
        <>
          <ellipse cx="222" cy="253" rx="120" ry="12" fill="#D4CDDF" />
          <circle cx="166" cy="130" r="49" fill="#D9AE87" />
          <circle cx="285" cy="141" r="42" fill="#99AE94" />
          <path
            d="M116 229C116 168 217 168 217 229V245H116V229Z"
            fill="#E3BD97"
          />
          <path
            d="M243 237C243 184 328 184 328 237V245H243V237Z"
            fill="#ABC09F"
          />
          <path
            d="M151 145Q166 158 181 145M272 153Q285 166 298 153"
            stroke="#665B4A"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="151" cy="127" r="3" fill="#665B4A" />
          <circle cx="181" cy="127" r="3" fill="#665B4A" />
          <circle cx="273" cy="139" r="3" fill="#665B4A" />
          <circle cx="298" cy="139" r="3" fill="#665B4A" />
          <path
            d="M222 83C199 66 209 44 223 54C239 40 254 64 222 83Z"
            fill="#C28B84"
          />
        </>
      ) : (
        <>
          <ellipse cx="220" cy="252" rx="128" ry="12" fill="#DBD7BB" />
          <circle cx="146" cy="174" r="58" fill="#DDAE7D" />
          <rect x="222" y="157" width="89" height="89" rx="10" fill="#99AF98" />
          <path d="M232 63L288 151H176L232 63Z" fill="#C7B5CB" />
          <circle cx="148" cy="173" r="25" stroke="#FAEAD0" strokeWidth="5" />
          <path
            d="M247 190H286M266 173V211"
            stroke="#EBF0DD"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}
