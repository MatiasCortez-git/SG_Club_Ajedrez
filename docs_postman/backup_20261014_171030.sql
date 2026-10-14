--
-- PostgreSQL database dump
--

\restrict S6yjDWfoadT4Z0gw9kBe5OOP7aJP0xegIcIToA5GfhEqF5fE1GXcehDpeYGVQhx

-- Dumped from database version 16.14 (Debian 16.14-1.pgdg13+1)
-- Dumped by pg_dump version 16.14 (Debian 16.14-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE ONLY public.usuario DROP CONSTRAINT usuario_id_persona_fkey;
ALTER TABLE ONLY public.taller DROP CONSTRAINT taller_id_profesor_fkey;
ALTER TABLE ONLY public.taller_horario DROP CONSTRAINT taller_horario_id_taller_fkey;
ALTER TABLE ONLY public.profesor DROP CONSTRAINT profesor_id_persona_fkey;
ALTER TABLE ONLY public.pago DROP CONSTRAINT pago_id_usuario_cobrador_fkey;
ALTER TABLE ONLY public.pago DROP CONSTRAINT pago_id_alumno_fkey;
ALTER TABLE ONLY public.token_recuperacion DROP CONSTRAINT fk_token_usuario;
ALTER TABLE ONLY public.federado DROP CONSTRAINT federado_id_persona_fkey;
ALTER TABLE ONLY public.detalle_cuota DROP CONSTRAINT detalle_cuota_id_cuota_fkey;
ALTER TABLE ONLY public.cuota DROP CONSTRAINT cuota_id_pago_fkey;
ALTER TABLE ONLY public.cuota DROP CONSTRAINT cuota_id_alumno_fkey;
ALTER TABLE ONLY public.alumno_taller DROP CONSTRAINT alumno_taller_id_taller_fkey;
ALTER TABLE ONLY public.alumno_taller DROP CONSTRAINT alumno_taller_id_alumno_fkey;
ALTER TABLE ONLY public.alumno DROP CONSTRAINT alumno_id_persona_fkey;
DROP TRIGGER trg_verificar_cupo ON public.alumno_taller;
ALTER TABLE ONLY public.usuario DROP CONSTRAINT usuario_username_key;
ALTER TABLE ONLY public.usuario DROP CONSTRAINT usuario_pkey;
ALTER TABLE ONLY public.token_recuperacion DROP CONSTRAINT token_recuperacion_token_key;
ALTER TABLE ONLY public.token_recuperacion DROP CONSTRAINT token_recuperacion_pkey;
ALTER TABLE ONLY public.tarifa_global DROP CONSTRAINT tarifa_global_pkey;
ALTER TABLE ONLY public.tarifa_global DROP CONSTRAINT tarifa_global_concepto_key;
ALTER TABLE ONLY public.taller DROP CONSTRAINT taller_pkey;
ALTER TABLE ONLY public.taller DROP CONSTRAINT taller_nombre_key;
ALTER TABLE ONLY public.taller_horario DROP CONSTRAINT taller_horario_pkey;
ALTER TABLE ONLY public.profesor DROP CONSTRAINT profesor_pkey;
ALTER TABLE ONLY public.persona DROP CONSTRAINT persona_pkey;
ALTER TABLE ONLY public.persona DROP CONSTRAINT persona_email_key;
ALTER TABLE ONLY public.persona DROP CONSTRAINT persona_dni_key;
ALTER TABLE ONLY public.pago DROP CONSTRAINT pago_pkey;
ALTER TABLE ONLY public.federado DROP CONSTRAINT federado_pkey;
ALTER TABLE ONLY public.federado DROP CONSTRAINT federado_cod_federacion_key;
ALTER TABLE ONLY public.detalle_cuota DROP CONSTRAINT detalle_cuota_pkey;
ALTER TABLE ONLY public.cuota DROP CONSTRAINT cuota_pkey;
ALTER TABLE ONLY public.alumno_taller DROP CONSTRAINT alumno_taller_pkey;
ALTER TABLE ONLY public.alumno DROP CONSTRAINT alumno_pkey;
ALTER TABLE public.usuario ALTER COLUMN id_usuario DROP DEFAULT;
ALTER TABLE public.token_recuperacion ALTER COLUMN id_token DROP DEFAULT;
ALTER TABLE public.tarifa_global ALTER COLUMN id_tarifa DROP DEFAULT;
ALTER TABLE public.taller_horario ALTER COLUMN id_horario DROP DEFAULT;
ALTER TABLE public.taller ALTER COLUMN id_taller DROP DEFAULT;
ALTER TABLE public.persona ALTER COLUMN id_persona DROP DEFAULT;
ALTER TABLE public.pago ALTER COLUMN id_pago DROP DEFAULT;
ALTER TABLE public.detalle_cuota ALTER COLUMN id_detalle DROP DEFAULT;
ALTER TABLE public.cuota ALTER COLUMN id_cuota DROP DEFAULT;
DROP SEQUENCE public.usuario_id_usuario_seq;
DROP TABLE public.usuario;
DROP SEQUENCE public.token_recuperacion_id_token_seq;
DROP TABLE public.token_recuperacion;
DROP SEQUENCE public.tarifa_global_id_tarifa_seq;
DROP TABLE public.tarifa_global;
DROP SEQUENCE public.taller_id_taller_seq;
DROP SEQUENCE public.taller_horario_id_horario_seq;
DROP TABLE public.taller_horario;
DROP TABLE public.taller;
DROP TABLE public.profesor;
DROP SEQUENCE public.persona_id_persona_seq;
DROP TABLE public.persona;
DROP SEQUENCE public.pago_id_pago_seq;
DROP TABLE public.pago;
DROP TABLE public.federado;
DROP SEQUENCE public.detalle_cuota_id_detalle_seq;
DROP TABLE public.detalle_cuota;
DROP SEQUENCE public.cuota_id_cuota_seq;
DROP TABLE public.cuota;
DROP TABLE public.alumno_taller;
DROP TABLE public.alumno;
DROP FUNCTION public.verificar_cupo_taller();
--
-- Name: verificar_cupo_taller(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.verificar_cupo_taller() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    cupos_ocupados INT;
    cupo_maximo_taller INT;
BEGIN
    -- Conteo simple y directo de la tabla de unión
    SELECT COUNT(*) INTO cupos_ocupados
    FROM alumno_taller
    WHERE id_taller = NEW.id_taller;

    SELECT cupo_maximo INTO cupo_maximo_taller
    FROM taller
    WHERE id_taller = NEW.id_taller;

    IF cupos_ocupados >= cupo_maximo_taller THEN
        RAISE EXCEPTION 'El taller ha alcanzado su cupo máximo';
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.verificar_cupo_taller() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: alumno; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.alumno (
    id_persona integer NOT NULL,
    fecha_nacimiento date NOT NULL
);


ALTER TABLE public.alumno OWNER TO postgres;

--
-- Name: alumno_taller; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.alumno_taller (
    id_alumno integer NOT NULL,
    id_taller integer NOT NULL,
    precio_acordado numeric(10,2) NOT NULL,
    fecha_inscripcion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.alumno_taller OWNER TO postgres;

--
-- Name: cuota; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cuota (
    id_cuota integer NOT NULL,
    id_alumno integer NOT NULL,
    periodo character varying(7) NOT NULL,
    fecha_vencimiento date NOT NULL,
    estado character varying(20) DEFAULT 'Pendiente'::character varying,
    id_pago integer,
    CONSTRAINT cuota_estado_check CHECK (((estado)::text = ANY ((ARRAY['Pendiente'::character varying, 'Pagada'::character varying, 'Vencida'::character varying, 'Anulada'::character varying])::text[])))
);


ALTER TABLE public.cuota OWNER TO postgres;

--
-- Name: cuota_id_cuota_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cuota_id_cuota_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cuota_id_cuota_seq OWNER TO postgres;

--
-- Name: cuota_id_cuota_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cuota_id_cuota_seq OWNED BY public.cuota.id_cuota;


--
-- Name: detalle_cuota; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.detalle_cuota (
    id_detalle integer NOT NULL,
    id_cuota integer NOT NULL,
    nombre_concepto character varying(100) NOT NULL,
    monto_congelado numeric(10,2) NOT NULL
);


ALTER TABLE public.detalle_cuota OWNER TO postgres;

--
-- Name: detalle_cuota_id_detalle_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.detalle_cuota_id_detalle_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.detalle_cuota_id_detalle_seq OWNER TO postgres;

--
-- Name: detalle_cuota_id_detalle_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.detalle_cuota_id_detalle_seq OWNED BY public.detalle_cuota.id_detalle;


--
-- Name: federado; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.federado (
    id_persona integer NOT NULL,
    cod_federacion character varying(50) NOT NULL,
    elo integer NOT NULL
);


ALTER TABLE public.federado OWNER TO postgres;

--
-- Name: pago; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pago (
    id_pago integer NOT NULL,
    id_alumno integer NOT NULL,
    id_usuario_cobrador integer NOT NULL,
    fecha_pago timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    monto_total numeric(10,2) NOT NULL,
    medio_pago character varying(50) NOT NULL,
    CONSTRAINT pago_medio_pago_check CHECK (((medio_pago)::text = ANY ((ARRAY['Efectivo'::character varying, 'Transferencia'::character varying, 'MercadoPago'::character varying, 'Tarjeta'::character varying])::text[])))
);


ALTER TABLE public.pago OWNER TO postgres;

--
-- Name: pago_id_pago_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pago_id_pago_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pago_id_pago_seq OWNER TO postgres;

--
-- Name: pago_id_pago_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pago_id_pago_seq OWNED BY public.pago.id_pago;


--
-- Name: persona; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.persona (
    id_persona integer NOT NULL,
    nombre character varying(100) NOT NULL,
    apellido character varying(100) NOT NULL,
    dni character varying(20) NOT NULL,
    email character varying(150),
    telefono character varying(50),
    is_active boolean DEFAULT true,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.persona OWNER TO postgres;

--
-- Name: persona_id_persona_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.persona_id_persona_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.persona_id_persona_seq OWNER TO postgres;

--
-- Name: persona_id_persona_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.persona_id_persona_seq OWNED BY public.persona.id_persona;


--
-- Name: profesor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profesor (
    id_persona integer NOT NULL
);


ALTER TABLE public.profesor OWNER TO postgres;

--
-- Name: taller; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.taller (
    id_taller integer NOT NULL,
    nombre character varying(150) NOT NULL,
    id_profesor integer NOT NULL,
    cupo_maximo integer NOT NULL,
    precio_actual numeric(10,2) NOT NULL,
    duracion character varying(50),
    edad_minima integer,
    edad_maxima integer,
    nivel character varying(50),
    is_active boolean DEFAULT true,
    CONSTRAINT taller_nivel_check CHECK (((nivel)::text = ANY ((ARRAY['Principiante'::character varying, 'Recreativo'::character varying, 'Federado'::character varying])::text[])))
);


ALTER TABLE public.taller OWNER TO postgres;

--
-- Name: taller_horario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.taller_horario (
    id_horario integer NOT NULL,
    id_taller integer NOT NULL,
    dia_semana character varying(20) NOT NULL,
    hora_inicio time without time zone NOT NULL,
    hora_fin time without time zone NOT NULL
);


ALTER TABLE public.taller_horario OWNER TO postgres;

--
-- Name: taller_horario_id_horario_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.taller_horario_id_horario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.taller_horario_id_horario_seq OWNER TO postgres;

--
-- Name: taller_horario_id_horario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.taller_horario_id_horario_seq OWNED BY public.taller_horario.id_horario;


--
-- Name: taller_id_taller_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.taller_id_taller_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.taller_id_taller_seq OWNER TO postgres;

--
-- Name: taller_id_taller_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.taller_id_taller_seq OWNED BY public.taller.id_taller;


--
-- Name: tarifa_global; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tarifa_global (
    id_tarifa integer NOT NULL,
    concepto character varying(100) NOT NULL,
    monto_actual numeric(10,2) NOT NULL,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.tarifa_global OWNER TO postgres;

--
-- Name: tarifa_global_id_tarifa_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tarifa_global_id_tarifa_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tarifa_global_id_tarifa_seq OWNER TO postgres;

--
-- Name: tarifa_global_id_tarifa_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tarifa_global_id_tarifa_seq OWNED BY public.tarifa_global.id_tarifa;


--
-- Name: token_recuperacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.token_recuperacion (
    id_token integer NOT NULL,
    token character varying(255) NOT NULL,
    fecha_expiracion timestamp without time zone NOT NULL,
    id_usuario integer NOT NULL
);


ALTER TABLE public.token_recuperacion OWNER TO postgres;

--
-- Name: token_recuperacion_id_token_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.token_recuperacion_id_token_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.token_recuperacion_id_token_seq OWNER TO postgres;

--
-- Name: token_recuperacion_id_token_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.token_recuperacion_id_token_seq OWNED BY public.token_recuperacion.id_token;


--
-- Name: usuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuario (
    id_usuario integer NOT NULL,
    username character varying(150) NOT NULL,
    password character varying(255) NOT NULL,
    rol character varying(50) NOT NULL,
    is_active boolean DEFAULT true,
    id_persona integer NOT NULL,
    debe_cambiar_password boolean DEFAULT true NOT NULL
);


ALTER TABLE public.usuario OWNER TO postgres;

--
-- Name: usuario_id_usuario_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuario_id_usuario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuario_id_usuario_seq OWNER TO postgres;

--
-- Name: usuario_id_usuario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuario_id_usuario_seq OWNED BY public.usuario.id_usuario;


--
-- Name: cuota id_cuota; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuota ALTER COLUMN id_cuota SET DEFAULT nextval('public.cuota_id_cuota_seq'::regclass);


--
-- Name: detalle_cuota id_detalle; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_cuota ALTER COLUMN id_detalle SET DEFAULT nextval('public.detalle_cuota_id_detalle_seq'::regclass);


--
-- Name: pago id_pago; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pago ALTER COLUMN id_pago SET DEFAULT nextval('public.pago_id_pago_seq'::regclass);


--
-- Name: persona id_persona; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.persona ALTER COLUMN id_persona SET DEFAULT nextval('public.persona_id_persona_seq'::regclass);


--
-- Name: taller id_taller; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.taller ALTER COLUMN id_taller SET DEFAULT nextval('public.taller_id_taller_seq'::regclass);


--
-- Name: taller_horario id_horario; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.taller_horario ALTER COLUMN id_horario SET DEFAULT nextval('public.taller_horario_id_horario_seq'::regclass);


--
-- Name: tarifa_global id_tarifa; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tarifa_global ALTER COLUMN id_tarifa SET DEFAULT nextval('public.tarifa_global_id_tarifa_seq'::regclass);


--
-- Name: token_recuperacion id_token; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.token_recuperacion ALTER COLUMN id_token SET DEFAULT nextval('public.token_recuperacion_id_token_seq'::regclass);


--
-- Name: usuario id_usuario; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario ALTER COLUMN id_usuario SET DEFAULT nextval('public.usuario_id_usuario_seq'::regclass);


--
-- Data for Name: alumno; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.alumno (id_persona, fecha_nacimiento) FROM stdin;
2	1990-11-30
3	1995-10-23
8	1987-12-09
\.


--
-- Data for Name: alumno_taller; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.alumno_taller (id_alumno, id_taller, precio_acordado, fecha_inscripcion) FROM stdin;
2	1	15000.00	2026-10-08 04:13:58.365868
3	2	8000.00	2026-10-08 04:13:58.365868
\.


--
-- Data for Name: cuota; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cuota (id_cuota, id_alumno, periodo, fecha_vencimiento, estado, id_pago) FROM stdin;
1	2	2026-07	2026-07-10	Pendiente	\N
2	3	2026-07	2026-07-10	Pagada	1
\.


--
-- Data for Name: detalle_cuota; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.detalle_cuota (id_detalle, id_cuota, nombre_concepto, monto_congelado) FROM stdin;
1	1	Cuota Socio	10000.00
2	1	Adicional Federado	3000.00
3	1	Taller Estrategia	15000.00
4	2	Cuota Socio	10000.00
5	2	Taller Iniciación	8000.00
\.


--
-- Data for Name: federado; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.federado (id_persona, cod_federacion, elo) FROM stdin;
1	FIDE-1010	2812
2	FIDE-9999	2882
8	FIDE-444	2789
\.


--
-- Data for Name: pago; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pago (id_pago, id_alumno, id_usuario_cobrador, fecha_pago, monto_total, medio_pago) FROM stdin;
1	3	1	2026-10-08 04:13:58.368564	18000.00	Transferencia
\.


--
-- Data for Name: persona; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.persona (id_persona, nombre, apellido, dni, email, telefono, is_active, fecha_creacion) FROM stdin;
1	Garry	Kasparov	11111111	garry@ajedrez.com	11223344	t	2026-10-08 04:13:58.346886
2	Magnus	Carlsen	22222222	magnus@ajedrez.com	55667788	t	2026-10-08 04:13:58.346886
3	Beth	Harmon	33333333	beth@ajedrez.com	99001122	t	2026-10-08 04:13:58.346886
4	Matias	Cortez	44444444	admin@admin.com	00000000	t	2026-10-08 04:13:58.346886
5	Bruno	Werner	55555555	bruno@ajedrez.com	00000000	t	2026-10-08 04:13:58.346886
8	Hikaru	Nakamura	99888777	hikaru@ajedrez.com	1155556666	t	2026-10-14 17:08:05.767348
\.


--
-- Data for Name: profesor; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.profesor (id_persona) FROM stdin;
1
\.


--
-- Data for Name: taller; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.taller (id_taller, nombre, id_profesor, cupo_maximo, precio_actual, duracion, edad_minima, edad_maxima, nivel, is_active) FROM stdin;
1	Estrategia Avanzada	1	10	15000.00	Anual	14	99	Federado	t
2	Iniciación al Ajedrez	1	20	10000.00	4 meses	8	99	Principiante	t
\.


--
-- Data for Name: taller_horario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.taller_horario (id_horario, id_taller, dia_semana, hora_inicio, hora_fin) FROM stdin;
1	1	Lunes	18:00:00	20:00:00
2	1	Miercoles	18:00:00	20:00:00
3	2	Martes	17:00:00	18:30:00
\.


--
-- Data for Name: tarifa_global; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tarifa_global (id_tarifa, concepto, monto_actual, fecha_actualizacion) FROM stdin;
1	Cuota Socio	10000.00	2026-10-08 04:13:58.34462
2	Adicional Federado	3000.00	2026-10-08 04:13:58.34462
\.


--
-- Data for Name: token_recuperacion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.token_recuperacion (id_token, token, fecha_expiracion, id_usuario) FROM stdin;
\.


--
-- Data for Name: usuario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuario (id_usuario, username, password, rol, is_active, id_persona, debe_cambiar_password) FROM stdin;
1	admin	$2a$10$s/KybK76jl9t9PJWC9BHt.5yvkjccvS1EuBcLl.i5C8qM7/yd7xrq	ROLE_ADMIN	t	4	f
2	profesor1	$2a$12$OOOcbAuEjigoQMS/bEt3AuG9IJ1eUtpsSOmyh5HGKZkOgT4q/Lzuu	ROLE_PROFESOR	t	1	f
3	profesor2	$2a$12$OOOcbAuEjigoQMS/bEt3AuG9IJ1eUtpsSOmyh5HGKZkOgT4q/Lzuu	ROLE_STAFF	t	5	f
\.


--
-- Name: cuota_id_cuota_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cuota_id_cuota_seq', 2, true);


--
-- Name: detalle_cuota_id_detalle_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.detalle_cuota_id_detalle_seq', 5, true);


--
-- Name: pago_id_pago_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pago_id_pago_seq', 1, true);


--
-- Name: persona_id_persona_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.persona_id_persona_seq', 8, true);


--
-- Name: taller_horario_id_horario_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.taller_horario_id_horario_seq', 3, true);


--
-- Name: taller_id_taller_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.taller_id_taller_seq', 2, true);


--
-- Name: tarifa_global_id_tarifa_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tarifa_global_id_tarifa_seq', 2, true);


--
-- Name: token_recuperacion_id_token_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.token_recuperacion_id_token_seq', 1, false);


--
-- Name: usuario_id_usuario_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuario_id_usuario_seq', 3, true);


--
-- Name: alumno alumno_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alumno
    ADD CONSTRAINT alumno_pkey PRIMARY KEY (id_persona);


--
-- Name: alumno_taller alumno_taller_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alumno_taller
    ADD CONSTRAINT alumno_taller_pkey PRIMARY KEY (id_alumno, id_taller);


--
-- Name: cuota cuota_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuota
    ADD CONSTRAINT cuota_pkey PRIMARY KEY (id_cuota);


--
-- Name: detalle_cuota detalle_cuota_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_cuota
    ADD CONSTRAINT detalle_cuota_pkey PRIMARY KEY (id_detalle);


--
-- Name: federado federado_cod_federacion_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.federado
    ADD CONSTRAINT federado_cod_federacion_key UNIQUE (cod_federacion);


--
-- Name: federado federado_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.federado
    ADD CONSTRAINT federado_pkey PRIMARY KEY (id_persona);


--
-- Name: pago pago_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pago
    ADD CONSTRAINT pago_pkey PRIMARY KEY (id_pago);


--
-- Name: persona persona_dni_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.persona
    ADD CONSTRAINT persona_dni_key UNIQUE (dni);


--
-- Name: persona persona_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.persona
    ADD CONSTRAINT persona_email_key UNIQUE (email);


--
-- Name: persona persona_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.persona
    ADD CONSTRAINT persona_pkey PRIMARY KEY (id_persona);


--
-- Name: profesor profesor_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesor
    ADD CONSTRAINT profesor_pkey PRIMARY KEY (id_persona);


--
-- Name: taller_horario taller_horario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.taller_horario
    ADD CONSTRAINT taller_horario_pkey PRIMARY KEY (id_horario);


--
-- Name: taller taller_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.taller
    ADD CONSTRAINT taller_nombre_key UNIQUE (nombre);


--
-- Name: taller taller_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.taller
    ADD CONSTRAINT taller_pkey PRIMARY KEY (id_taller);


--
-- Name: tarifa_global tarifa_global_concepto_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tarifa_global
    ADD CONSTRAINT tarifa_global_concepto_key UNIQUE (concepto);


--
-- Name: tarifa_global tarifa_global_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tarifa_global
    ADD CONSTRAINT tarifa_global_pkey PRIMARY KEY (id_tarifa);


--
-- Name: token_recuperacion token_recuperacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.token_recuperacion
    ADD CONSTRAINT token_recuperacion_pkey PRIMARY KEY (id_token);


--
-- Name: token_recuperacion token_recuperacion_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.token_recuperacion
    ADD CONSTRAINT token_recuperacion_token_key UNIQUE (token);


--
-- Name: usuario usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_pkey PRIMARY KEY (id_usuario);


--
-- Name: usuario usuario_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_username_key UNIQUE (username);


--
-- Name: alumno_taller trg_verificar_cupo; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_verificar_cupo BEFORE INSERT ON public.alumno_taller FOR EACH ROW EXECUTE FUNCTION public.verificar_cupo_taller();


--
-- Name: alumno alumno_id_persona_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alumno
    ADD CONSTRAINT alumno_id_persona_fkey FOREIGN KEY (id_persona) REFERENCES public.persona(id_persona);


--
-- Name: alumno_taller alumno_taller_id_alumno_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alumno_taller
    ADD CONSTRAINT alumno_taller_id_alumno_fkey FOREIGN KEY (id_alumno) REFERENCES public.alumno(id_persona);


--
-- Name: alumno_taller alumno_taller_id_taller_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alumno_taller
    ADD CONSTRAINT alumno_taller_id_taller_fkey FOREIGN KEY (id_taller) REFERENCES public.taller(id_taller);


--
-- Name: cuota cuota_id_alumno_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuota
    ADD CONSTRAINT cuota_id_alumno_fkey FOREIGN KEY (id_alumno) REFERENCES public.alumno(id_persona);


--
-- Name: cuota cuota_id_pago_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuota
    ADD CONSTRAINT cuota_id_pago_fkey FOREIGN KEY (id_pago) REFERENCES public.pago(id_pago);


--
-- Name: detalle_cuota detalle_cuota_id_cuota_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_cuota
    ADD CONSTRAINT detalle_cuota_id_cuota_fkey FOREIGN KEY (id_cuota) REFERENCES public.cuota(id_cuota) ON DELETE CASCADE;


--
-- Name: federado federado_id_persona_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.federado
    ADD CONSTRAINT federado_id_persona_fkey FOREIGN KEY (id_persona) REFERENCES public.persona(id_persona);


--
-- Name: token_recuperacion fk_token_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.token_recuperacion
    ADD CONSTRAINT fk_token_usuario FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario) ON DELETE CASCADE;


--
-- Name: pago pago_id_alumno_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pago
    ADD CONSTRAINT pago_id_alumno_fkey FOREIGN KEY (id_alumno) REFERENCES public.alumno(id_persona);


--
-- Name: pago pago_id_usuario_cobrador_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pago
    ADD CONSTRAINT pago_id_usuario_cobrador_fkey FOREIGN KEY (id_usuario_cobrador) REFERENCES public.usuario(id_usuario);


--
-- Name: profesor profesor_id_persona_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesor
    ADD CONSTRAINT profesor_id_persona_fkey FOREIGN KEY (id_persona) REFERENCES public.persona(id_persona);


--
-- Name: taller_horario taller_horario_id_taller_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.taller_horario
    ADD CONSTRAINT taller_horario_id_taller_fkey FOREIGN KEY (id_taller) REFERENCES public.taller(id_taller);


--
-- Name: taller taller_id_profesor_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.taller
    ADD CONSTRAINT taller_id_profesor_fkey FOREIGN KEY (id_profesor) REFERENCES public.profesor(id_persona);


--
-- Name: usuario usuario_id_persona_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_id_persona_fkey FOREIGN KEY (id_persona) REFERENCES public.persona(id_persona);


--
-- PostgreSQL database dump complete
--

\unrestrict S6yjDWfoadT4Z0gw9kBe5OOP7aJP0xegIcIToA5GfhEqF5fE1GXcehDpeYGVQhx

