-- Use this to set up your database.

-- PostgreSQL database dump
--

-- Dumped from database version 15.12 (Debian 15.12-0+deb12u2)
-- Dumped by pg_dump version 15.12 (Debian 15.12-0+deb12u2)

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

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: eric
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO eric;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: eric
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: eric
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO eric;

--
-- Name: hierarchy; Type: TABLE; Schema: public; Owner: eric
--

CREATE TABLE public.hierarchy (
    id uuid NOT NULL,
    parent_id uuid
);


ALTER TABLE public.hierarchy OWNER TO eric;

--
-- Name: metadata; Type: TABLE; Schema: public; Owner: eric
--

CREATE TABLE public.metadata (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    file_type character varying(50),
    is_folder boolean NOT NULL,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.metadata OWNER TO eric;

--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: eric
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: hierarchy hierarchy_pkey; Type: CONSTRAINT; Schema: public; Owner: eric
--

ALTER TABLE ONLY public.hierarchy
    ADD CONSTRAINT hierarchy_pkey PRIMARY KEY (id);


--
-- Name: metadata metadata_pkey; Type: CONSTRAINT; Schema: public; Owner: eric
--

ALTER TABLE ONLY public.metadata
    ADD CONSTRAINT metadata_pkey PRIMARY KEY (id);


--
-- Name: hierarchy hierarchy_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: eric
--

ALTER TABLE ONLY public.hierarchy
    ADD CONSTRAINT hierarchy_id_fkey FOREIGN KEY (id) REFERENCES public.metadata(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: hierarchy hierarchy_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: eric
--

ALTER TABLE ONLY public.hierarchy
    ADD CONSTRAINT hierarchy_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.hierarchy(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: eric
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

